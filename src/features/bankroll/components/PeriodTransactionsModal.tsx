"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fEUR } from "@/shared/lib/formatters";
import { Plus, Trash2 } from "lucide-react";
import {
  useBankrollTransactions,
  useCreateBankrollTransaction,
  useDeleteBankrollTransaction,
} from "@/features/bets/hooks/useBankrollTransactions";
import type { MonthlyPeriodEnriched } from "@/features/bankroll/types/period.types";

interface PeriodTransactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: MonthlyPeriodEnriched | null;
}

export function PeriodTransactionsModal({
  open,
  onOpenChange,
  period,
}: PeriodTransactionsModalProps) {
  const { data: allTransactions, isLoading } = useBankrollTransactions();
  const { mutateAsync: createTransaction, isPending: isCreating } = useCreateBankrollTransaction();
  const { mutateAsync: deleteTransaction, isPending: isDeleting } = useDeleteBankrollTransaction();

  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && period) {
      const now = new Date();
      // Asegurarnos de trabajar con la fecha local para evitar saltos de mes por UTC
      const [yearStr, monthStr] = period.period_month.split("-");
      const pYear = parseInt(yearStr, 10);
      const pMonth = parseInt(monthStr, 10) - 1;

      if (now.getFullYear() === pYear && now.getMonth() === pMonth) {
        // Si es el mes actual, usamos la fecha y hora de hoy
        const tzoffset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
        setDate(localISOTime);
      } else {
        // Si es un mes pasado/futuro, ponemos por defecto el día 1 de ese mes a las 12:00
        const monthFormatted = String(pMonth + 1).padStart(2, "0");
        setDate(`${pYear}-${monthFormatted}-01T12:00`);
      }
    }
  }, [open, period]);

  if (!period) return null;

  const [pYearStr, pMonthStr] = period.period_month.split("-");
  const pYear = parseInt(pYearStr, 10);
  const pMonth = parseInt(pMonthStr, 10) - 1; // 0-indexed

  // Limites para el input de fecha (min y max del mes)
  const lastDay = new Date(pYear, pMonth + 1, 0).getDate();
  const minDate = `${pYearStr}-${pMonthStr}-01T00:00`;
  const maxDate = `${pYearStr}-${pMonthStr}-${String(lastDay).padStart(2, "0")}T23:59`;

  const periodTransactions = (allTransactions ?? []).filter((tx) => {
    // Usamos split para asegurar que obtenemos el año y mes correcto de la fecha de transacción en local
    const [txYearStr, txMonthStr] = tx.transaction_date.split("T")[0].split("-");
    return parseInt(txYearStr, 10) === pYear && parseInt(txMonthStr, 10) - 1 === pMonth;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;

    try {
      await createTransaction({
        type,
        amount: Number(amount),
        transaction_date: new Date(date).toISOString(),
        notes: notes || undefined,
      });
      setAmount("");
      setNotes("");
    } catch (err) {
      // toast already in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Seguro que quieres eliminar esta transacción?")) {
      await deleteTransaction(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Ingresos y Retiros - {format(new Date(pYear, pMonth, 1), "MMMM yyyy", { locale: es })}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleAdd}
          className="flex flex-wrap items-end gap-3 bg-muted/50 p-4 rounded-md border"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium">Tipo</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={type}
              onChange={(e) => setType(e.target.value as "deposit" | "withdrawal")}
            >
              <option value="deposit">Ingreso (+)</option>
              <option value="withdrawal">Retiro (-)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Cantidad (€)</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Fecha y Hora</label>
            <Input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs font-medium">Notas</label>
            <Input
              placeholder="Ej. Ingreso mensual"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isCreating} className="gap-2">
            <Plus className="h-4 w-4" /> Añadir
          </Button>
        </form>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && periodTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay ingresos ni retiros en este mes.
                  </TableCell>
                </TableRow>
              )}
              {periodTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {format(new Date(tx.transaction_date), "dd MMM yyyy, HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {tx.type === "initial" ? (
                      <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                        Banca Inicial
                      </Badge>
                    ) : tx.type === "deposit" ? (
                      <Badge variant="outline" className="text-green-500 border-green-500/30">
                        Ingreso
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-500 border-red-500/30">
                        Retiro
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={`font-medium ${tx.type === "withdrawal" ? "text-red-500" : tx.type === "initial" ? "text-blue-500" : "text-green-500"}`}
                  >
                    {tx.type === "withdrawal" ? "-" : "+"}
                    {fEUR(tx.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.notes ?? "—"}</TableCell>
                  <TableCell>
                    {tx.type !== "initial" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tx.id)}
                        disabled={isDeleting}
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
