import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BankrollTransaction, BankrollTransactionInput } from "../types/transaction.types";
import type { TablesInsert } from "@/integrations/supabase/types";

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
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
      qc.invalidateQueries({ queryKey: ["monthly-periods"] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useDeleteBankrollTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bankroll_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Transacción eliminada");
      qc.invalidateQueries({ queryKey: ["bankroll-transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
      qc.invalidateQueries({ queryKey: ["monthly-periods"] });
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
    mutationFn: async ({
      amount,
      notes,
      transactionDate,
    }: {
      amount: number;
      notes?: string;
      transactionDate?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // 0. Obtener la transacción "initial" existente para preservar su fecha si no se provee una nueva
      const { data: existingInitial } = await supabase
        .from("bankroll_transactions")
        .select("transaction_date")
        .eq("user_id", user.id)
        .eq("type", "initial")
        .order("transaction_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      const finalDate =
        transactionDate ?? existingInitial?.transaction_date ?? new Date().toISOString();

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
        transaction_date: finalDate,
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
 * Ajusta la banca actual insertando una transacción correctiva (deposit o withdrawal).
 * No borra el historial de transacciones.
 */
export const useSetBankroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      delta,
      transactionDate,
      notes,
    }: {
      delta: number;
      transactionDate: string;
      notes?: string;
    }) => {
      if (delta === 0) return; // Nada que ajustar

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error: insError } = await supabase.from("bankroll_transactions").insert({
        user_id: user.id,
        type: delta > 0 ? "deposit" : "withdrawal",
        amount: Math.abs(delta),
        transaction_date: transactionDate,
        notes: notes ?? "Ajuste manual de banca",
      });

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
