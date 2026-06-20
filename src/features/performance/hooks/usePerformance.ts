import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TipsterMonthlyRow {
  tipster: string;
  month: string;
  picks: number;
  wins: number;
  losses: number;
  pushes: number;
  winRate: number;
  profit: number;
  yield: number;
}

export const useTipsterMonthly = () =>
  useQuery({
    queryKey: ["performance", "tipster-monthly"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_tipster_monthly")
        .select("*")
        .order("month", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        tipster: r.tipster as string,
        month: r.month as string,
        picks: Number(r.picks ?? 0),
        wins: Number(r.wins ?? 0),
        losses: Number(r.losses ?? 0),
        pushes: Number(r.pushes ?? 0),
        winRate: Number(r.win_rate ?? 0),
        profit: Number(r.profit ?? 0),
        yield: Number(r.yield ?? 0),
      })) as TipsterMonthlyRow[];
    },
  });

export interface DailyTipsterPoint {
  date: string;
  [tipster: string]: number | string;
}

export const useDailyPnLByTipster = () =>
  useQuery({
    queryKey: ["performance", "daily-tipster"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bets")
        .select("bet_date, tipster, pnl, result")
        .not("result", "is", null)
        .order("bet_date", { ascending: true });
      if (error) throw error;
      const tipsters = Array.from(new Set((data ?? []).map((r) => r.tipster as string)));
      const dates = Array.from(new Set((data ?? []).map((r) => r.bet_date as string))).sort();
      const running = new Map<string, number>(tipsters.map((t) => [t, 0]));
      const points: DailyTipsterPoint[] = [];
      for (const d of dates) {
        for (const row of data ?? []) {
          if (row.bet_date === d) {
            running.set(row.tipster, (running.get(row.tipster) ?? 0) + Number(row.pnl ?? 0));
          }
        }
        const p: DailyTipsterPoint = { date: d };
        for (const t of tipsters) p[t] = parseFloat((running.get(t) ?? 0).toFixed(2));
        points.push(p);
      }
      return { points, tipsters };
    },
  });

export const useResultDistribution = () =>
  useQuery({
    queryKey: ["performance", "distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bets")
        .select("result")
        .not("result", "is", null);
      if (error) throw error;
      const count = { W: 0, L: 0, P: 0 };
      data.forEach((b) => {
        if (b.result === "W") count.W++;
        if (b.result === "L") count.L++;
        if (b.result === "P") count.P++;
      });
      return [
        { name: "W", value: count.W, fill: "#22c55e" }, // Green (Win)
        { name: "L", value: count.L, fill: "#ef4444" }, // Red (Loss)
        { name: "P", value: count.P, fill: "#3b82f6" }, // Blue (Push)
      ];
    },
  });