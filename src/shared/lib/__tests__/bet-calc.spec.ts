import { describe, it, expect } from "vitest";
import { calcPnL, calcYield, calcWinRate, calcCurrentStreak } from "../bet-calc";
import type { BetResult } from "@/features/bets/types/bet.types";

// ── bet-calc ─────────────────────────────────────────────────────────────────
//
// Unit tests for the four pure calculation functions in bet-calc.ts.
// No React, no Supabase, no TanStack Query — purely functional.
//
// Formula reference (from JSDoc in source):
//   calcPnL:   W → stake × (odds − 1)  ·  L → −stake  ·  P → 0
//   calcYield: profit / staked × 100  (0 when staked === 0)
//   calcWinRate: wins / (wins + losses) × 100  (0 when denominator === 0)
//   calcCurrentStreak: positive = win streak, negative = loss streak
//                      (bets expected DESC by date, first = most recent)
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────────────────────

const bet = (result: BetResult | null) => ({ result });

// ── calcPnL ──────────────────────────────────────────────────────────────────

describe("calcPnL", () => {
  it("Win: returns stake × (odds − 1)", () => {
    expect(calcPnL(10, 2.5, "W")).toBe(15);
  });

  it("Win: rounds to 2 decimal places", () => {
    expect(calcPnL(10, 1.333, "W")).toBe(3.33);
  });

  it("Win at odds 1.0: returns 0 (no profit possible)", () => {
    expect(calcPnL(10, 1.0, "W")).toBe(0);
  });

  it("Loss: returns −stake", () => {
    expect(calcPnL(10, 2.5, "L")).toBe(-10);
  });

  it("Loss: handles decimal stake", () => {
    expect(calcPnL(7.5, 3.0, "L")).toBe(-7.5);
  });

  it("Push: always returns 0 regardless of odds", () => {
    expect(calcPnL(20, 3.5, "P")).toBe(0);
  });

  it("Win with large stake returns correct precision", () => {
    expect(calcPnL(100, 1.9, "W")).toBe(90);
  });
});

// ── calcYield ─────────────────────────────────────────────────────────────────

describe("calcYield", () => {
  it("positive profit: returns correct yield percentage", () => {
    expect(calcYield(10, 100)).toBe(10);
  });

  it("negative profit: returns negative yield", () => {
    expect(calcYield(-25, 100)).toBe(-25);
  });

  it("zero profit: returns 0", () => {
    expect(calcYield(0, 100)).toBe(0);
  });

  it("zero staked: returns 0 (no division by zero)", () => {
    expect(calcYield(50, 0)).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    // 5 / 30 * 100 = 16.666... → 16.67
    expect(calcYield(5, 30)).toBe(16.67);
  });

  it("staked and profit are the same: returns 100%", () => {
    expect(calcYield(50, 50)).toBe(100);
  });
});

// ── calcWinRate ───────────────────────────────────────────────────────────────

describe("calcWinRate", () => {
  it("equal wins and losses: returns 50", () => {
    expect(calcWinRate(5, 5)).toBe(50);
  });

  it("only wins: returns 100", () => {
    expect(calcWinRate(10, 0)).toBe(100);
  });

  it("only losses: returns 0", () => {
    expect(calcWinRate(0, 10)).toBe(0);
  });

  it("zero wins and zero losses: returns 0 (no division by zero)", () => {
    expect(calcWinRate(0, 0)).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    // 1 / 3 × 100 = 33.333... → 33.33
    expect(calcWinRate(1, 2)).toBe(33.33);
  });

  it("pushes do not count in win rate denominator", () => {
    // Push bets are excluded from wins/losses, so pass only settled counts
    expect(calcWinRate(3, 1)).toBe(75);
  });
});

// ── calcCurrentStreak ─────────────────────────────────────────────────────────

describe("calcCurrentStreak", () => {
  it("empty array: returns 0", () => {
    expect(calcCurrentStreak([])).toBe(0);
  });

  it("all pending (no settled): returns 0", () => {
    expect(calcCurrentStreak([bet(null), bet(null)])).toBe(0);
  });

  it("all pushes: returns 0 (P is not W or L)", () => {
    expect(calcCurrentStreak([bet("P"), bet("P")])).toBe(0);
  });

  it("single win: returns +1", () => {
    expect(calcCurrentStreak([bet("W")])).toBe(1);
  });

  it("single loss: returns −1", () => {
    expect(calcCurrentStreak([bet("L")])).toBe(-1);
  });

  it("consecutive wins: returns positive count", () => {
    expect(calcCurrentStreak([bet("W"), bet("W"), bet("W")])).toBe(3);
  });

  it("consecutive losses: returns negative count", () => {
    expect(calcCurrentStreak([bet("L"), bet("L"), bet("L")])).toBe(-3);
  });

  it("streak broken by opposite result: counts only the current streak", () => {
    // DESC order: W, W, L → current streak is 2 wins
    expect(calcCurrentStreak([bet("W"), bet("W"), bet("L")])).toBe(2);
  });

  it("streak broken by push: push is ignored, streak continues through it", () => {
    // P is filtered out — W, P, W means settled = [W, W] → streak = 2
    expect(calcCurrentStreak([bet("W"), bet("P"), bet("W")])).toBe(2);
  });

  it("streak broken by null (pending): pending is ignored, streak continues", () => {
    // null filtered out — W, null, W → settled = [W, W] → streak = 2
    expect(calcCurrentStreak([bet("W"), bet(null), bet("W")])).toBe(2);
  });

  it("loss streak after wins: reflects the most recent settled bets", () => {
    // DESC: L, L, W → current streak = −2
    expect(calcCurrentStreak([bet("L"), bet("L"), bet("W")])).toBe(-2);
  });
});
