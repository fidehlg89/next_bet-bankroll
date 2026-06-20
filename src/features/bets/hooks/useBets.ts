import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Bet, BetResult, Market } from "../types/bet.types";

export interface BetFilters {
  tipster?: string;
  market?: Market | "all";
  month?: string; // YYYY-MM
  result?: BetResult | "pending" | "all";
}

export const useBets = (filters?: BetFilters) =>
  useQuery({
    queryKey: ["bets", filters],
    queryFn: async () => {
      let q = supabase
        .from("bets")
        .select("*")
        .order("bet_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (filters?.tipster && filters.tipster !== "all") q = q.eq("tipster", filters.tipster);
      if (filters?.market && filters.market !== "all") q = q.eq("market", filters.market);
      if (filters?.month) {
        const start = `${filters.month}-01`;
        const [y, m] = filters.month.split("-").map(Number);
        const next = new Date(Date.UTC(y, m, 1));
        const end = next.toISOString().slice(0, 10);
        q = q.gte("bet_date", start).lt("bet_date", end);
      }
      if (filters?.result === "pending") q = q.is("result", null);
      else if (filters?.result && filters.result !== "all") q = q.eq("result", filters.result);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Bet[];
    },
  });

export const useTipsterList = () =>
  useQuery({
    queryKey: ["tipsters-distinct"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bets").select("tipster").order("tipster");
      if (error) throw error;
      return Array.from(new Set((data ?? []).map((r) => r.tipster))).filter(Boolean) as string[];
    },
  });
