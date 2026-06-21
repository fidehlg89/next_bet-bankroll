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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useCreateBankrollTransaction,
  useUpsertInitialBankroll,
} from "@/features/bets/hooks/useBankrollTransactions";
import { Wallet } from "lucide-react";

// ── Schema: ajuste de banca actual (escribe el valor real → calcula delta) ──
const adjustSchema = z.object({
  newBalance: z.coerce.number().min(0, "El valor no puede ser negativo"),
  transaction_date: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
});

// ── Schema: editar banca inicial ──
const initialSchema = z.object({
  amount: z.coerce.number().min(0, "El valor no puede ser negativo"),
  notes: z.string().optional(),
});

type AdjustValues = z.infer<typeof adjustSchema>;
type InitialValues = z.infer<typeof initialSchema>;

interface BankrollAdjustmentModalProps {
  currentBankroll?: number;
  baseBankroll?: number;
}

export function BankrollAdjustmentModal({
  currentBankroll = 0,
  baseBankroll = 0,
}: BankrollAdjustmentModalProps) {
  const [open, setOpen] = useState(false);

  const { mutateAsync: createTransaction, isPending: isAdjusting } =
    useCreateBankrollTransaction();
  const { mutateAsync: upsertInitial, isPending: isUpdatingInitial } =
    useUpsertInitialBankroll();

  // ── Formulario: ajuste de banca actual ──
  const adjustForm = useForm<AdjustValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      newBalance: currentBankroll,
      transaction_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  // ── Formulario: banca inicial ──
  const initialForm = useForm<InitialValues>({
    resolver: zodResolver(initialSchema),
    defaultValues: {
      amount: baseBankroll,
      notes: "",
    },
  });

  // Pre-carga valores al abrir el modal
  useEffect(() => {
    if (open) {
      adjustForm.reset({
        newBalance: currentBankroll,
        transaction_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      initialForm.reset({
        amount: baseBankroll,
        notes: "",
      });
    }
  }, [open, currentBankroll, baseBankroll, adjustForm, initialForm]);

  const onAdjustSubmit = async (values: AdjustValues) => {
    const delta = parseFloat((values.newBalance - currentBankroll).toFixed(2));
    if (delta === 0) {
      setOpen(false);
      return;
    }
    const type = delta > 0 ? "deposit" : "withdrawal";
    const amount = Math.abs(delta);
    try {
      await createTransaction({
        type,
        amount,
        transaction_date: new Date(values.transaction_date).toISOString(),
        notes: values.notes,
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const onInitialSubmit = async (values: InitialValues) => {
    try {
      await upsertInitial({ amount: values.amount, notes: values.notes });
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const watchedBalance = adjustForm.watch("newBalance");
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

        <Tabs defaultValue="adjust">
          <TabsList className="w-full">
            <TabsTrigger value="adjust" className="flex-1">
              Banca actual
            </TabsTrigger>
            <TabsTrigger value="initial" className="flex-1">
              Banca inicial
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Ajustar banca actual ── */}
          <TabsContent value="adjust">
            <Form {...adjustForm}>
              <form
                onSubmit={adjustForm.handleSubmit(onAdjustSubmit)}
                className="space-y-4 pt-2"
              >
                <FormField
                  control={adjustForm.control}
                  name="newBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banca actual (€)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      {delta !== 0 && (
                        <p
                          className={`text-xs font-medium ${
                            delta > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {delta > 0 ? `+${delta.toFixed(2)} €` : `${delta.toFixed(2)} €`}{" "}
                          respecto al valor actual
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={adjustForm.control}
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
                  control={adjustForm.control}
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
                  <Button type="submit" disabled={isAdjusting}>
                    {isAdjusting ? "Guardando..." : "Guardar Ajuste"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* ── Tab 2: Editar banca inicial ── */}
          <TabsContent value="initial">
            <Form {...initialForm}>
              <form
                onSubmit={initialForm.handleSubmit(onInitialSubmit)}
                className="space-y-4 pt-2"
              >
                <p className="text-sm text-muted-foreground">
                  Establece el capital de arranque. Solo cambia la base; el P&L de tus apuestas no se ve afectado.
                </p>

                <FormField
                  control={initialForm.control}
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
                  control={initialForm.control}
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
                  <Button type="submit" disabled={isUpdatingInitial}>
                    {isUpdatingInitial ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
