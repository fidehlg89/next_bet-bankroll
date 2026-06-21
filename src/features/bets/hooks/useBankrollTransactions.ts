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
