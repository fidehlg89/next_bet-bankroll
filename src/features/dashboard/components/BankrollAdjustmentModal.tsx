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
import { useSetBankroll } from "@/features/bets/hooks/useBankrollTransactions";
import { Wallet } from "lucide-react";

const formSchema = z.object({
  initialBalance: z.coerce.number().min(0, "El valor no puede ser negativo"),
  newBalance: z.coerce.number().min(0, "El valor no puede ser negativo"),
  transaction_date: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BankrollAdjustmentModalProps {
  /** Valor total calculado: baseBankroll + profit (lo que se muestra en el KPI) */
  currentBankroll?: number;
  /** Suma de todas las transacciones (initial + deposits - withdrawals) */
  baseBankroll?: number;
  /** P&L generado por apuestas (no se toca aquí) */
  profit?: number;
}

export function BankrollAdjustmentModal({
  currentBankroll = 0,
  baseBankroll = 0,
  profit = 0,
}: BankrollAdjustmentModalProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: setBankroll, isPending } = useSetBankroll();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialBalance: baseBankroll,
      newBalance: currentBankroll,
      transaction_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        initialBalance: baseBankroll,
        newBalance: currentBankroll,
        transaction_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [open, currentBankroll, baseBankroll, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await setBankroll({
        initialBalance: values.initialBalance,
        newBalance: values.newBalance,
        profit,
        transactionDate: new Date(values.transaction_date).toISOString(),
        notes: values.notes,
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const watchedBalance = form.watch("newBalance");
  const delta =
    typeof watchedBalance === "number"
      ? parseFloat((watchedBalance - currentBankroll).toFixed(2))
      : 0;

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
              name="newBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banca actual (€)</FormLabel>
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
                      {delta > 0 ? `+${delta.toFixed(2)} €` : `${delta.toFixed(2)} €`} respecto al
                      valor actual
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar Ajuste"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
