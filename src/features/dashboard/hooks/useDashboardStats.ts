import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  MarketStat,
  TipsterStat,
  DailyBankroll,
  Market,
} from "@/features/bets/types/bet.types";

export const useMarketStats = () =>
  useQuery({
    queryKey: ["dashboard", "market"],
    queryFn: async () => {
      const { data, error } = await supabase.from("v_market_stats").select("*");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        market: r.market as Market,
        picks: Number(r.picks ?? 0),
        wins: Number(r.wins ?? 0),
        losses: Number(r.losses ?? 0),
        winRate: Number(r.win_rate ?? 0),
        profit: Number(r.profit ?? 0),
        yield: Number(r.yield ?? 0),
      })) as MarketStat[];
    },
  });

export const useTipsterStats = () =>
  useQuery({
    queryKey: ["dashboard", "tipster"],
    queryFn: async () => {
      const { data, error } = await supabase.from("v_tipster_monthly").select("*");
      if (error) throw error;
      const map = new Map<
        string,
        { picks: number; wins: number; losses: number; profit: number; stake: number }
      >();
      // aggregate across months
      for (const r of data ?? []) {
        const k = r.tipster as string;
        const cur = map.get(k) ?? { picks: 0, wins: 0, losses: 0, profit: 0, stake: 0 };
        cur.picks += Number(r.picks ?? 0);
        cur.wins += Number(r.wins ?? 0);
        cur.losses += Number(r.losses ?? 0);
        cur.profit += Number(r.profit ?? 0);
        map.set(k, cur);
      }
      // need yield per tipster from bets
      const { data: bets } = await supabase
        .from("bets")
        .select("tipster, stake, bet_type, result")
        .not("result", "is", null);
      const stakeMap = new Map<string, number>();
      for (const b of bets ?? []) {
        if (b.bet_type === "Bono") continue;
        stakeMap.set(b.tipster, (stakeMap.get(b.tipster) ?? 0) + Number(b.stake));
      }
      const result: TipsterStat[] = [];
      for (const [tipster, v] of map) {
        const stake = stakeMap.get(tipster) ?? 0;
        result.push({
          tipster,
          picks: v.picks,
          wins: v.wins,
          losses: v.losses,
          winRate:
            v.wins + v.losses ? Number(((v.wins / (v.wins + v.losses)) * 100).toFixed(2)) : 0,
          profit: Number(v.profit.toFixed(2)),
          yield: stake ? Number(((v.profit / stake) * 100).toFixed(2)) : 0,
        });
      }
      return result.sort((a, b) => b.profit - a.profit);
    },
  });

export const useBankrollDaily = (initial = 100) =>
  useQuery({
    queryKey: ["dashboard", "bankroll"],
    queryFn: async () => {
      const [betsRes, transRes] = await Promise.all([
        supabase
          .from("v_bankroll_daily")
          .select("bet_date, cumulative_pnl")
          .order("bet_date", { ascending: true }),
        supabase
          .from("bankroll_transactions")
          .select("transaction_date, type, amount")
          .order("transaction_date", { ascending: true })
      ]);

      if (betsRes.error) throw betsRes.error;
      
      // We don't throw if transRes fails (e.g. table doesn't exist yet), we just log and proceed
      if (transRes.error) {
        console.warn("Could not fetch bankroll_transactions:", transRes.error);
      }

      // Group transactions by date (YYYY-MM-DD)
      const transByDate = new Map<string, number>();
      if (!transRes.error) {
        for (const t of transRes.data ?? []) {
          const d = t.transaction_date.slice(0, 10);
          const amount = Number(t.amount);
          const net = t.type === "withdrawal" ? -amount : amount;
          transByDate.set(d, (transByDate.get(d) ?? 0) + net);
        }
      }

      // Dedupe bets per date keeping the last cumulative value
      const map = new Map<string, number>();
      for (const r of betsRes.data ?? []) {
        const d = r.bet_date as string;
        const v = Number(r.cumulative_pnl ?? 0);
        if (!map.has(d) || v > (map.get(d) ?? 0)) map.set(d, v);
      }

      // Merge all dates from both bets and transactions
      const allDates = Array.from(new Set([...map.keys(), ...transByDate.keys()]))
        .sort((a, b) => a.localeCompare(b));

      const out: (DailyBankroll & { bankroll: number })[] = [];
      let currentCumulativeTrans = initial; // start with initial (or 0 if initial adjustments are all in DB)
      
      // If there are transactions, we should probably ignore the 'initial' param and just use transactions, 
      // but to be safe we'll use 'initial' only if there are no transactions.
      if (!transRes.error && transRes.data && transRes.data.length > 0) {
         currentCumulativeTrans = 0; 
      }

      let lastPnl = 0;

      for (const date of allDates) {
        if (transByDate.has(date)) {
          currentCumulativeTrans += transByDate.get(date)!;
        }
        if (map.has(date)) {
          lastPnl = map.get(date)!;
        }
        
        out.push({ 
          date, 
          cumulativePnl: lastPnl, 
          bankroll: parseFloat((currentCumulativeTrans + lastPnl).toFixed(2)) 
        });
      }
      return out;
    },
  });
