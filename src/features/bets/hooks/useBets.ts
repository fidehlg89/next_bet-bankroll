import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Bet, BetResult, Market } from "../types/bet.types";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export interface BetFilters {
  tipster?: string;
  market?: Market | "all";
  dateRange?: DateRange;
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
      if (filters?.dateRange?.from) {
        q = q.gte("bet_date", format(filters.dateRange.from, "yyyy-MM-dd"));
      }
      if (filters?.dateRange?.to) {
        q = q.lte("bet_date", format(filters.dateRange.to, "yyyy-MM-dd"));
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
      // Fetch from tipsters table to get all registered tipsters
      const { data: tData, error: tError } = await supabase
        .from("tipsters")
        .select("name")
        .order("name");
      if (tError) throw tError;

      // Fallback: also fetch recent distinct tipsters from bets in case some are missing in tipsters table
      const { data: bData } = await supabase
        .from("bets")
        .select("tipster")
        .order("tipster")
        .limit(1000);

      const names = new Set<string>();
      (tData ?? []).forEach((r) => names.add(r.name));
      (bData ?? []).forEach((r) => names.add(r.tipster));

      return Array.from(names).filter(Boolean).sort();
    },
  });
