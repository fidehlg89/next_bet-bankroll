import { useMemo } from "react";
import { calcCurrentStreak, calcWinRate, calcYield } from "@/shared/lib/bet-calc";
import type { Bet, BetStats } from "../types/bet.types";
import type { BankrollTransaction } from "../types/transaction.types";

export const INITIAL_BANKROLL = 108.64; // banca semilla declarada en el Sheet

export function useBetStats(
  bets: Bet[] | undefined,
  transactions?: BankrollTransaction[],
  /** When set, overrides initialBankroll with the active period's opening balance */
  activePeriodOpeningBalance?: number | null,
): BetStats {
  return useMemo(() => {
    const hasManualTransactions = transactions && transactions.length > 0;
    let baseBankroll = INITIAL_BANKROLL;
    let initialBankroll = INITIAL_BANKROLL;
    if (hasManualTransactions) {
      // baseBankroll: suma de TODAS las transacciones (este es el bankroll actual)
      baseBankroll = transactions!.reduce((acc, t) => {
        if (t.type === "deposit" || t.type === "initial") return acc + Number(t.amount);
        if (t.type === "withdrawal") return acc - Number(t.amount);
        return acc;
      }, 0);
      // initialBankroll: solo las transacciones "initial" (para mostrar "Inicial X €")
      initialBankroll = transactions!.reduce((acc, t) => {
        if (t.type === "initial") return acc + Number(t.amount);
        return acc;
      }, 0);
    }

    const list = bets ?? [];
    const settled = list.filter((b) => b.result !== null);
    const wins = settled.filter((b) => b.result === "W").length;
    const losses = settled.filter((b) => b.result === "L").length;
    const pushes = settled.filter((b) => b.result === "P").length;
    const pendingBets = list.filter((b) => b.result === null);
    const pending = pendingBets.length;
    const pendingStake = pendingBets.reduce((s, b) => s + Number(b.stake), 0);
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
    // When a monthly period is active, use its opening_balance as the
    // displayed "initial" figure so the KPI reflects the current period start.
    const displayedInitial =
      activePeriodOpeningBalance != null ? activePeriodOpeningBalance : initialBankroll;

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
      initialBankroll: parseFloat(displayedInitial.toFixed(2)),
      baseBankroll: parseFloat(baseBankroll.toFixed(2)),
      currentBankroll: parseFloat((baseBankroll + profit - pendingStake).toFixed(2)),
      pendingStake: parseFloat(pendingStake.toFixed(2)),
      bestWin,
      worstLoss,
      currentStreak: calcCurrentStreak(list),
      totalStaked: parseFloat(totalStaked.toFixed(2)),
    };
  }, [bets, transactions, activePeriodOpeningBalance]);
}
