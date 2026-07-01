import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBetStats, INITIAL_BANKROLL } from "../useBetStats";
import type { Bet } from "../../types/bet.types";
import type { BankrollTransaction } from "../../types/transaction.types";

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: crypto.randomUUID(),
    bet_date: "2025-06-01T10:00:00Z",
    event: "Real Madrid vs Barcelona",
    market: "Football",
    pick: "Real Madrid",
    bet_type: "Simple",
    tipster: "tipsterA",
    odds: 2.0,
    stake: 10,
    result: null,
    pnl: null,
    user_id: "user-1",
    created_at: "2025-06-01T10:00:00Z",
    ...overrides,
  };
}

function makeTx(overrides: Partial<BankrollTransaction> = {}): BankrollTransaction {
  return {
    id: crypto.randomUUID(),
    amount: 100,
    type: "deposit",
    date: "2025-06-01T10:00:00Z",
    notes: "",
    user_id: "user-1",
    created_at: "2025-06-01T10:00:00Z",
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("useBetStats", () => {
  describe("empty state", () => {
    it("returns 0 for all metrics when bets and transactions are empty", () => {
      const { result } = renderHook(() => useBetStats([], []));

      expect(result.current.totalPicks).toBe(0);
      expect(result.current.wins).toBe(0);
      expect(result.current.losses).toBe(0);
      expect(result.current.pushes).toBe(0);
      expect(result.current.pending).toBe(0);
      expect(result.current.winRate).toBe(0);
      expect(result.current.profit).toBe(0);
      expect(result.current.yield).toBe(0);
      expect(result.current.avgOdds).toBe(0);
      expect(result.current.avgStake).toBe(0);
      expect(result.current.pendingStake).toBe(0);
      expect(result.current.bestWin).toBe(0);
      expect(result.current.worstLoss).toBe(0);
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.totalStaked).toBe(0);
    });

    it("uses INITIAL_BANKROLL when no transactions are provided", () => {
      const { result } = renderHook(() => useBetStats([], []));
      expect(result.current.initialBankroll).toBe(INITIAL_BANKROLL);
      expect(result.current.baseBankroll).toBe(INITIAL_BANKROLL);
      expect(result.current.currentBankroll).toBe(INITIAL_BANKROLL);
    });

    it("handles undefined arguments safely", () => {
      const { result } = renderHook(() => useBetStats(undefined, undefined));
      expect(result.current.totalPicks).toBe(0);
      expect(result.current.initialBankroll).toBe(INITIAL_BANKROLL);
    });
  });

  describe("bankroll calculations", () => {
    it("processes 'initial' transactions to update initialBankroll and baseBankroll", () => {
      const txs = [makeTx({ type: "initial", amount: 500 })];
      const { result } = renderHook(() => useBetStats([], txs));

      expect(result.current.initialBankroll).toBe(500);
      expect(result.current.baseBankroll).toBe(500);
      expect(result.current.currentBankroll).toBe(500);
    });

    it("processes deposit and withdrawal transactions correctly", () => {
      const txs = [
        makeTx({ type: "initial", amount: 500 }),
        makeTx({ type: "deposit", amount: 200 }),
        makeTx({ type: "withdrawal", amount: 50 }),
      ];
      const { result } = renderHook(() => useBetStats([], txs));

      expect(result.current.initialBankroll).toBe(500); // only initial
      expect(result.current.baseBankroll).toBe(650); // 500 + 200 - 50
      expect(result.current.currentBankroll).toBe(650); // baseBankroll with no profit/pending
    });

    it("subtracts pendingStake and adds profit to compute currentBankroll", () => {
      const txs = [makeTx({ type: "initial", amount: 1000 })];
      const bets = [
        makeBet({ stake: 100, result: "W", pnl: 100 }), // Profit +100
        makeBet({ stake: 50, result: null, pnl: null }), // Pending stake 50
      ];
      const { result } = renderHook(() => useBetStats(bets, txs));

      expect(result.current.baseBankroll).toBe(1000);
      expect(result.current.profit).toBe(100);
      expect(result.current.pendingStake).toBe(50);
      // currentBankroll = baseBankroll + profit - pendingStake = 1000 + 100 - 50 = 1050
      expect(result.current.currentBankroll).toBe(1050);
    });

    it("overrides initialBankroll with activePeriodOpeningBalance", () => {
      const txs = [makeTx({ type: "initial", amount: 1000 })];
      const { result } = renderHook(() => useBetStats([], txs, 2000));

      expect(result.current.initialBankroll).toBe(2000);
      expect(result.current.baseBankroll).toBe(1000); // baseBankroll ignores the override
    });
  });

  describe("settled vs pending bets", () => {
    it("counts pending bets correctly and sums their stake", () => {
      const bets = [
        makeBet({ stake: 10, result: null }),
        makeBet({ stake: 20, result: null }),
        makeBet({ stake: 30, result: "W", pnl: 30 }),
      ];
      const { result } = renderHook(() => useBetStats(bets));

      expect(result.current.totalPicks).toBe(3);
      expect(result.current.pending).toBe(2);
      expect(result.current.pendingStake).toBe(30); // 10 + 20
    });

    it("calculates totalStaked, avgOdds, avgStake ONLY from settled bets", () => {
      const bets = [
        makeBet({ stake: 10, odds: 2.0, result: "W" }),
        makeBet({ stake: 20, odds: 3.0, result: "L" }),
        makeBet({ stake: 50, odds: 5.0, result: null }), // pending, should be ignored
      ];
      const { result } = renderHook(() => useBetStats(bets));

      expect(result.current.totalStaked).toBe(30); // 10 + 20
      expect(result.current.avgOdds).toBe(2.5); // (2.0 + 3.0) / 2
      expect(result.current.avgStake).toBe(15); // (10 + 20) / 2
    });

    it("excludes 'Bono' bets from stakedForYield but includes them in totalStaked", () => {
      const bets = [
        makeBet({ stake: 100, bet_type: "Simple", result: "W", pnl: 100 }),
        makeBet({ stake: 50, bet_type: "Bono", result: "W", pnl: 50 }),
      ];
      const { result } = renderHook(() => useBetStats(bets));

      expect(result.current.profit).toBe(150); // 100 + 50
      expect(result.current.totalStaked).toBe(150); // 100 + 50
      // Yield = profit / stakedForYield * 100 = 150 / 100 * 100 = 150%
      expect(result.current.yield).toBe(150);
    });
  });

  describe("pnl and metrics", () => {
    it("computes profit from sum of pnl in settled bets", () => {
      const bets = [
        makeBet({ result: "W", pnl: 10.5 }),
        makeBet({ result: "L", pnl: -5.2 }),
        makeBet({ result: "W", pnl: 20.1 }),
      ];
      const { result } = renderHook(() => useBetStats(bets));

      // 10.5 - 5.2 + 20.1 = 25.4
      expect(result.current.profit).toBe(25.4);
    });

    it("finds bestWin and worstLoss from pnl array", () => {
      const bets = [
        makeBet({ result: "W", pnl: 10.5 }),
        makeBet({ result: "L", pnl: -5.2 }),
        makeBet({ result: "W", pnl: 50.0 }), // best
        makeBet({ result: "L", pnl: -100.0 }), // worst
        makeBet({ result: "P", pnl: 0 }),
      ];
      const { result } = renderHook(() => useBetStats(bets));

      expect(result.current.bestWin).toBe(50.0);
      expect(result.current.worstLoss).toBe(-100.0);
    });
  });
});
