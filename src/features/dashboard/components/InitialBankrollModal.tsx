import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpsertInitialBankroll } from "@/features/bets/hooks/useBankrollTransactions";
import { Settings2 } from "lucide-react";

const formSchema = z.object({
  amount: z.coerce.number().min(0, "El valor no puede ser negativo"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InitialBankrollModalProps {
  baseBankroll?: number;
}

export function InitialBankrollModal({ baseBankroll = 0 }: InitialBankrollModalProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: upsertInitial, isPending } = useUpsertInitialBankroll();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: baseBankroll,
      notes: "",
    },
  });

  // Cuando se abre el modal, pre-carga la banca inicial actual
  useEffect(() => {
    if (open) {
      form.reset({
        amount: baseBankroll,
        notes: "",
      });
    }
  }, [open, baseBankroll, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await upsertInitial({ amount: values.amount, notes: values.notes });
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Settings2 className="h-4 w-4" />
          Editar Inicial
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Banca Inicial</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Establece el capital de arranque de tu banca. Esto no afecta a tus apuestas ni a tu P&L, solo cambia el valor base desde el que se calcula el bankroll actual.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banca inicial (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Banca inicial temporada 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
