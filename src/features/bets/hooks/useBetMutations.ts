import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calcPnL } from "@/shared/lib/bet-calc";
import type { Bet, BetResult } from "../types/bet.types";
import type { BetFormValues } from "../schemas/bet.schema";
import { toast } from "sonner";

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["bets"] });
  qc.invalidateQueries({ queryKey: ["tipsters-distinct"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["monthly"] });
  qc.invalidateQueries({ queryKey: ["performance"] });
};

// Patch every cached ["bets", ...] list in place to preserve row order.
const patchBetInCache = (
  qc: ReturnType<typeof useQueryClient>,
  id: string,
  patch: Partial<Bet>,
) => {
  qc.setQueriesData<Bet[]>({ queryKey: ["bets"] }, (old) =>
    old ? old.map((b) => (b.id === id ? { ...b, ...patch } : b)) : old,
  );
};

export const useCreateBet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: BetFormValues) => {
      const { data: userRes } = await supabase.auth.getUser();
      const user_id = userRes.user?.id;
      if (!user_id) throw new Error("No autenticado");
      const result = values.result ? (values.result as BetResult) : null;
      const pnl = result ? calcPnL(values.stake, values.odds, result) : null;
      const { error } = await supabase.from("bets").insert({
        user_id,
        bet_date: values.bet_date,
        event: values.event || null,
        market: values.market,
        pick: values.pick || null,
        bet_type: values.bet_type,
        tipster: values.tipster,
        odds: values.odds,
        stake: values.stake,
        result,
        pnl,
        notes: values.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pick guardado");
      invalidate(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useSettleBet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      result,
      odds,
      stake,
    }: {
      id: string;
      result: BetResult;
      odds: number;
      stake: number;
    }) => {
      const pnl = calcPnL(stake, odds, result);
      const { error } = await supabase.from("bets").update({ result, pnl }).eq("id", id);
      if (error) throw error;
      return { id, result, pnl };
    },
    onMutate: ({ id, result, odds, stake }) => {
      const pnl = calcPnL(stake, odds, result);
      patchBetInCache(qc, id, { result, pnl });
    },
    onSuccess: () => {
      // Refresh aggregates without touching the bets list order.
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["monthly"] });
      qc.invalidateQueries({ queryKey: ["performance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateBetTipster = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tipster }: { id: string; tipster: string }) => {
      const { error } = await supabase.from("bets").update({ tipster }).eq("id", id);
      if (error) throw error;
    },
    onMutate: ({ id, tipster }) => {
      patchBetInCache(qc, id, { tipster });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tipsters-distinct"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["monthly"] });
      qc.invalidateQueries({ queryKey: ["performance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteBet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pick eliminado");
      invalidate(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateBet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: BetFormValues }) => {
      const result = values.result ? (values.result as BetResult) : null;
      const pnl = result ? calcPnL(values.stake, values.odds, result) : null;
      const { error } = await supabase
        .from("bets")
        .update({
          bet_date: values.bet_date,
          event: values.event || null,
          market: values.market,
          pick: values.pick || null,
          bet_type: values.bet_type,
          tipster: values.tipster,
          odds: values.odds,
          stake: values.stake,
          result,
          pnl,
          notes: values.notes || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: ({ id, values }) => {
      const result = values.result ? (values.result as BetResult) : null;
      const pnl = result ? calcPnL(values.stake, values.odds, result) : null;
      patchBetInCache(qc, id, {
        bet_date: values.bet_date,
        event: values.event || null,
        market: values.market,
        pick: values.pick || null,
        bet_type: values.bet_type,
        tipster: values.tipster,
        odds: values.odds,
        stake: values.stake,
        result,
        pnl,
        notes: values.notes || null,
      });
    },
    onSuccess: () => {
      toast.success("Pick actualizado");
      invalidate(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

