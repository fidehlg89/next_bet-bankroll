import { useMemo } from "react";
import type { Bet } from "@/features/bets/types/bet.types";
import { calcWinRate, calcYield } from "@/shared/lib/bet-calc";

export interface MonthlyRow {
  month: string; // YYYY-MM
  picks: number;
  wins: number;
  losses: number;
  pushes: number;
  winRate: number;
  profit: number;
  yield: number;
  bankroll: number;
}

export function useMonthlyAnalysis(bets: Bet[] | undefined, initial = 100) {
  return useMemo(() => {
    const settled = (bets ?? []).filter((b) => b.result);
    const map = new Map<string, MonthlyRow>();
    for (const b of settled) {
      const month = b.bet_date.slice(0, 7);
      const row = map.get(month) ?? { month, picks: 0, wins: 0, losses: 0, pushes: 0, winRate: 0, profit: 0, yield: 0, bankroll: 0 };
      row.picks += 1;
      if (b.result === "W") row.wins += 1;
      else if (b.result === "L") row.losses += 1;
      else if (b.result === "P") row.pushes += 1;
      row.profit += Number(b.pnl ?? 0);
      map.set(month, row);
    }
    // sort ascending then compute bankroll cumulative
    const sorted = Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
    let running = initial;
    for (const r of sorted) {
      r.winRate = calcWinRate(r.wins, r.losses);
      const stakeMonth = settled
        .filter((b) => b.bet_date.slice(0, 7) === r.month && b.bet_type !== "Bono")
        .reduce((s, b) => s + Number(b.stake), 0);
      r.yield = calcYield(r.profit, stakeMonth);
      r.profit = parseFloat(r.profit.toFixed(2));
      running += r.profit;
      r.bankroll = parseFloat(running.toFixed(2));
    }
    return sorted.reverse();
  }, [bets, initial]);
}

export function useBestWorst(bets: Bet[] | undefined, n = 5) {
  return useMemo(() => {
    const settled = (bets ?? []).filter((b) => b.result === "W" || b.result === "L");
    const sortedByPnl = [...settled].sort((a, b) => Number(b.pnl ?? 0) - Number(a.pnl ?? 0));
    const wonByOdds = settled.filter((b) => b.result === "W").sort((a, b) => Number(b.odds) - Number(a.odds));
    return {
      best: sortedByPnl.slice(0, n),
      worst: sortedByPnl.slice(-n).reverse(),
      bestOdds: wonByOdds.slice(0, n),
    };
  }, [bets, n]);
}