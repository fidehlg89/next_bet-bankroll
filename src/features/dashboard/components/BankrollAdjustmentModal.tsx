import { useState, useEffect, useRef } from "react";
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
import {
  useSetBankroll,
  useUpsertInitialBankroll,
} from "@/features/bets/hooks/useBankrollTransactions";
import { Wallet } from "lucide-react";

const formSchema = z.object({
  initialBalance: z.coerce.number().min(0, "El valor no puede ser negativo"),
  newBalance: z.coerce.number().min(0, "El valor no puede ser negativo"),
  transaction_date: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BankrollAdjustmentModalProps {
  currentBankroll?: number;
  initialBankroll?: number;
}

export function BankrollAdjustmentModal({
  currentBankroll = 0,
  initialBankroll = 0,
}: BankrollAdjustmentModalProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: setBankroll, isPending: isSetting } = useSetBankroll();
  const { mutateAsync: upsertInitial, isPending: isUpserting } = useUpsertInitialBankroll();

  const isPending = isSetting || isUpserting;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialBalance: initialBankroll,
      newBalance: currentBankroll,
      transaction_date: new Date().toISOString().split("T")[0],
      notes: "Ajuste manual de banca",
    },
  });

  const previousInitialRef = useRef(initialBankroll);

  useEffect(() => {
    if (open) {
      form.reset({
        initialBalance: initialBankroll,
        newBalance: currentBankroll,
        transaction_date: new Date().toISOString().split("T")[0],
        notes: "Ajuste manual de banca",
      });
      previousInitialRef.current = initialBankroll;
    }
  }, [open, currentBankroll, initialBankroll, form]);

  const watchedInitial = form.watch("initialBalance");
  useEffect(() => {
    const parsedInitial = Number(watchedInitial);
    if (!isNaN(parsedInitial) && parsedInitial !== previousInitialRef.current) {
      const diff = parsedInitial - previousInitialRef.current;
      const currentNew = Number(form.getValues("newBalance"));
      form.setValue("newBalance", Number((currentNew + diff).toFixed(2)));
      previousInitialRef.current = parsedInitial;
    }
  }, [watchedInitial, form]);

  const watchedBalance = form.watch("newBalance");
  const parsedBalance = Number(watchedBalance);

  // Calculate delta against what the current bankroll SHOULD be based on the new initial bankroll
  const expectedCurrentBankroll = currentBankroll + (Number(watchedInitial) - initialBankroll);

  const delta = !isNaN(parsedBalance)
    ? parseFloat((parsedBalance - expectedCurrentBankroll).toFixed(2))
    : 0;

  const initialDelta = Number(watchedInitial) - initialBankroll;

  const onSubmit = async (values: FormValues) => {
    try {
      if (initialDelta !== 0) {
        await upsertInitial({ amount: values.initialBalance, notes: values.notes });
      }

      if (delta !== 0) {
        await setBankroll({
          delta,
          transactionDate: new Date(values.transaction_date).toISOString(),
          notes: values.notes,
        });
      }

      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          Ajustar Banca
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuste de Bankroll</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="initialBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banca Inicial (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  {initialDelta !== 0 && (
                    <p className="text-xs font-medium text-amber-500">
                      Modificarás el saldo inicial en{" "}
                      {initialDelta > 0 ? `+${initialDelta.toFixed(2)}` : initialDelta.toFixed(2)} €
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banca Actual (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  {delta !== 0 && (
                    <p
                      data-testid="delta-indicator"
                      className={`text-xs font-medium ${
                        delta > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {delta > 0 ? `+${delta.toFixed(2)} €` : `${delta.toFixed(2)} €`} como ajuste
                      (Ingreso/Retiro extra)
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                    <Input placeholder="Ej. Depósito mensual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isPending || (delta === 0 && initialDelta === 0)}>
                {isPending ? "Guardando..." : "Guardar Ajuste"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
