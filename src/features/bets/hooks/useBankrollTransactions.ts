import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BankrollTransaction, BankrollTransactionInput } from "../types/transaction.types";

export const useBankrollTransactions = () =>
  useQuery({
    queryKey: ["bankroll-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bankroll_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return (data ?? []) as BankrollTransaction[];
    },
  });

export const useCreateBankrollTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: BankrollTransactionInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error } = await supabase.from("bankroll_transactions").insert({
        ...values,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Transacción registrada");
      qc.invalidateQueries({ queryKey: ["bankroll-transactions"] });
      // Invalidate dependent dashboard stats
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

/**
 * Reemplaza el bankroll inicial del usuario.
 * Elimina todas las transacciones de tipo "initial" existentes e inserta una nueva
 * para que siempre haya exactamente una que represente la banca de arranque.
 */
export const useUpsertInitialBankroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, notes }: { amount: number; notes?: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // 1. Borrar todas las transacciones "initial" del usuario
      const { error: delError } = await supabase
        .from("bankroll_transactions")
        .delete()
        .eq("user_id", user.id)
        .eq("type", "initial");
      if (delError) throw delError;

      // 2. Insertar la nueva banca inicial
      const { error: insError } = await supabase.from("bankroll_transactions").insert({
        user_id: user.id,
        type: "initial",
        amount,
        transaction_date: new Date().toISOString(),
        notes: notes ?? null,
      });
      if (insError) throw insError;
    },
    onSuccess: () => {
      toast.success("Banca inicial actualizada");
      qc.invalidateQueries({ queryKey: ["bankroll-transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

/**
 * Guarda la banca inicial y la banca actual de forma atómica:
 * 1. Borra TODAS las transacciones existentes del usuario.
 * 2. Crea una transacción "initial" con `initialBalance`.
 * 3. Si es necesario, crea una transacción "deposit" o "withdrawal" para
 *    que baseBankroll + profit = newBalance.
 *
 * Fórmula:
 *   baseBankroll  = initialBalance + adjustment
 *   currentBankroll = baseBankroll + profit = newBalance
 *   → adjustment = newBalance - initialBalance - profit
 */
export const useSetBankroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      initialBalance,
      newBalance,
      profit,
      transactionDate,
      notes,
    }: {
      initialBalance: number;
      newBalance: number;
      profit: number;
      transactionDate: string;
      notes?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // 1. Borrar TODAS las transacciones previas
      const { error: delError } = await supabase
        .from("bankroll_transactions")
        .delete()
        .eq("user_id", user.id);
      if (delError) throw delError;

      // 2. Insertar la transacción inicial
      const records: object[] = [
        {
          user_id: user.id,
          type: "initial",
          amount: initialBalance,
          transaction_date: transactionDate,
          notes: notes ?? null,
        },
      ];

      // 3. Calcular el ajuste: newBalance = initial + adjustment
      // El profit de apuestas se muestra APARTE en el KPI de Profit,
      // no se suma aquí para que el bankroll muestre exactamente lo que el usuario pone.
      const adjustment = parseFloat((newBalance - initialBalance).toFixed(2));
      if (Math.abs(adjustment) >= 0.01) {
        records.push({
          user_id: user.id,
          type: adjustment > 0 ? "deposit" : "withdrawal",
          amount: Math.abs(adjustment),
          transaction_date: transactionDate,
          notes: notes ?? null,
        });
      }

      const { error: insError } = await supabase
        .from("bankroll_transactions")
        .insert(records);
      if (insError) throw insError;
    },
    onSuccess: () => {
      toast.success("Banca actualizada correctamente");
      qc.invalidateQueries({ queryKey: ["bankroll-transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};
