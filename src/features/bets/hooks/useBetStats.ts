import { useMemo } from "react";
import { calcCurrentStreak, calcWinRate, calcYield } from "@/shared/lib/bet-calc";
import type { Bet, BetStats } from "../types/bet.types";

export const INITIAL_BANKROLL = 108.64; // banca semilla declarada en el Sheet

export function useBetStats(bets: Bet[] | undefined, initialBankroll = INITIAL_BANKROLL): BetStats {
  return useMemo(() => {
    const list = bets ?? [];
    const settled = list.filter((b) => b.result !== null);
    const wins = settled.filter((b) => b.result === "W").length;
    const losses = settled.filter((b) => b.result === "L").length;
    const pushes = settled.filter((b) => b.result === "P").length;
    const pending = list.length - settled.length;
    const profit = settled.reduce((s, b) => s + Number(b.pnl ?? 0), 0);
    const stakedForYield = settled
      .filter((b) => b.bet_type !== "Bono")
      .reduce((s, b) => s + Number(b.stake), 0);
    const totalStaked = settled.reduce((s, b) => s + Number(b.stake), 0);
    const avgOdds = settled.length
      ? settled.reduce((s, b) => s + Number(b.odds), 0) / settled.length
      : 0;
    const avgStake = settled.length ? totalStaked / settled.length : 0;
    const pnls = settled.map((b) => Number(b.pnl ?? 0));
    const bestWin = pnls.length ? Math.max(...pnls) : 0;
    const worstLoss = pnls.length ? Math.min(...pnls) : 0;
    return {
      totalPicks: list.length,
      wins,
      losses,
      pushes,
      pending,
      winRate: calcWinRate(wins, losses),
      profit: parseFloat(profit.toFixed(2)),
      yield: calcYield(profit, stakedForYield),
      avgOdds: parseFloat(avgOdds.toFixed(3)),
      avgStake: parseFloat(avgStake.toFixed(2)),
      currentBankroll: parseFloat((initialBankroll + profit).toFixed(2)),
      bestWin,
      worstLoss,
      currentStreak: calcCurrentStreak(list),
      totalStaked: parseFloat(totalStaked.toFixed(2)),
    };
  }, [bets, initialBankroll]);
}
