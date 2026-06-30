import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBetStats, INITIAL_BANKROLL } from "../useBetStats";
import type { Bet } from "../../types/bet.types";
import type { BankrollTransaction } from "../../types/transaction.types";

// ── Fixtures ────────────────────────────────────────────────────────────────

/** Crea una apuesta mínima con resultado (liquidada). */
const makeSettledBet = (overrides: Partial<Bet> & { result: "W" | "L" | "P" }): Bet => ({
  id: crypto.randomUUID(),
  user_id: "u1",
  bet_date: "2025-01-01",
  event: "Event A",
  market: "Football",
  pick: "Home",
  bet_type: "Simple",
  tipster: "tipsterA",
  odds: 2.0,
  stake: 10,
  notes: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  pnl: overrides.result === "W" ? 10 : overrides.result === "L" ? -10 : 0,
  ...overrides,
});

/** Crea una apuesta pendiente (sin resultado). */
const makePendingBet = (overrides?: Partial<Bet>): Bet => ({
  id: crypto.randomUUID(),
  user_id: "u1",
  bet_date: "2025-01-02",
  event: "Event B",
  market: "Football",
  pick: "Away",
  bet_type: "Simple",
  tipster: "tipsterA",
  odds: 1.8,
  stake: 15,
  result: null,
  pnl: null,
  notes: null,
  created_at: "2025-01-02T00:00:00Z",
  updated_at: "2025-01-02T00:00:00Z",
  ...overrides,
});

/** Transacción de banca mínima. */
const makeTransaction = (
  type: BankrollTransaction["type"],
  amount: number,
): BankrollTransaction => ({
  id: crypto.randomUUID(),
  user_id: "u1",
  transaction_date: "2025-01-01",
  type,
  amount,
  notes: null,
  created_at: "2025-01-01T00:00:00Z",
});

// ── Helper ───────────────────────────────────────────────────────────────────

function runHook(
  bets: Bet[],
  transactions?: BankrollTransaction[],
  activePeriodOpeningBalance?: number | null,
) {
  const { result } = renderHook(() => useBetStats(bets, transactions, activePeriodOpeningBalance));
  return result.current;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("useBetStats — pendingStake & currentBankroll (issue #30)", () => {
  // ── Baseline ────────────────────────────────────────────────────────────

  it("sin apuestas: pendingStake=0 y currentBankroll=baseBankroll", () => {
    const stats = runHook([]);

    expect(stats.pendingStake).toBe(0);
    expect(stats.currentBankroll).toBe(INITIAL_BANKROLL);
    expect(stats.pending).toBe(0);
  });

  // ── Solo apuestas liquidadas ─────────────────────────────────────────────

  it("todas las apuestas liquidadas: pendingStake=0, currentBankroll incluye el profit correctamente", () => {
    const bets = [
      makeSettledBet({ result: "W", stake: 10, odds: 2.0, pnl: 10 }),
      makeSettledBet({ result: "L", stake: 5, odds: 1.5, pnl: -5 }),
    ];
    const stats = runHook(bets);

    expect(stats.pendingStake).toBe(0);
    expect(stats.pending).toBe(0);
    // profit = 10 + (-5) = 5
    expect(stats.profit).toBe(5);
    // currentBankroll = INITIAL_BANKROLL + 5 - 0
    expect(stats.currentBankroll).toBe(parseFloat((INITIAL_BANKROLL + 5).toFixed(2)));
  });

  // ── Solo apuestas pendientes (issue #30 core) ────────────────────────────

  it("una apuesta pendiente: pendingStake == stake de esa apuesta", () => {
    const bets = [makePendingBet({ stake: 20 })];
    const stats = runHook(bets);

    expect(stats.pendingStake).toBe(20);
    expect(stats.pending).toBe(1);
  });

  it("una apuesta pendiente: currentBankroll se descuenta el pendingStake", () => {
    const bets = [makePendingBet({ stake: 20 })];
    const stats = runHook(bets);

    // profit = 0 (no hay liquidadas), pendingStake = 20
    const expected = parseFloat((INITIAL_BANKROLL + 0 - 20).toFixed(2));
    expect(stats.currentBankroll).toBe(expected);
  });

  it("múltiples picks pendientes: pendingStake acumula todos los stakes", () => {
    const bets = [
      makePendingBet({ stake: 10 }),
      makePendingBet({ stake: 15 }),
      makePendingBet({ stake: 5 }),
    ];
    const stats = runHook(bets);

    expect(stats.pendingStake).toBe(30);
    expect(stats.pending).toBe(3);
    const expected = parseFloat((INITIAL_BANKROLL - 30).toFixed(2));
    expect(stats.currentBankroll).toBe(expected);
  });

  // ── Mix liquidadas + pendientes ──────────────────────────────────────────

  it("mix liquidadas y pendientes: currentBankroll = baseBankroll + profit - pendingStake", () => {
    const bets = [
      makeSettledBet({ result: "W", stake: 10, odds: 2.0, pnl: 10 }),
      makeSettledBet({ result: "L", stake: 10, odds: 2.0, pnl: -10 }),
      makePendingBet({ stake: 25 }),
    ];
    const stats = runHook(bets);

    // profit = 10 + (-10) = 0
    expect(stats.profit).toBe(0);
    expect(stats.pendingStake).toBe(25);
    expect(stats.pending).toBe(1);

    const expected = parseFloat((INITIAL_BANKROLL + 0 - 25).toFixed(2));
    expect(stats.currentBankroll).toBe(expected);
  });

  it("apuesta P (push) liquidada no suma al pendingStake", () => {
    const bets = [
      makeSettledBet({ result: "P", stake: 10, odds: 1.8, pnl: 0 }),
      makePendingBet({ stake: 12 }),
    ];
    const stats = runHook(bets);

    expect(stats.pendingStake).toBe(12);
    expect(stats.profit).toBe(0);
    const expected = parseFloat((INITIAL_BANKROLL - 12).toFixed(2));
    expect(stats.currentBankroll).toBe(expected);
  });

  // ── Con transacciones de banca ───────────────────────────────────────────

  it("con transacciones: pendingStake se descuenta del baseBankroll correcto", () => {
    const transactions = [makeTransaction("initial", 200), makeTransaction("deposit", 50)];
    const bets = [
      makeSettledBet({ result: "W", stake: 10, odds: 2.0, pnl: 10 }),
      makePendingBet({ stake: 30 }),
    ];
    const stats = runHook(bets, transactions);

    // baseBankroll = 200 + 50 = 250
    // profit = 10, pendingStake = 30
    // currentBankroll = 250 + 10 - 30 = 230
    expect(stats.baseBankroll).toBe(250);
    expect(stats.profit).toBe(10);
    expect(stats.pendingStake).toBe(30);
    expect(stats.currentBankroll).toBe(230);
  });

  it("con retiro en transacciones: pendingStake sigue descontándose correctamente", () => {
    const transactions = [makeTransaction("initial", 300), makeTransaction("withdrawal", 50)];
    const bets = [makePendingBet({ stake: 20 })];
    const stats = runHook(bets, transactions);

    // baseBankroll = 300 - 50 = 250
    // profit = 0, pendingStake = 20
    // currentBankroll = 250 - 20 = 230
    expect(stats.baseBankroll).toBe(250);
    expect(stats.pendingStake).toBe(20);
    expect(stats.currentBankroll).toBe(230);
  });

  // ── Consistencia de otros campos ─────────────────────────────────────────

  it("totalPicks incluye tanto liquidadas como pendientes", () => {
    const bets = [
      makeSettledBet({ result: "W", stake: 10, odds: 2.0, pnl: 10 }),
      makePendingBet({ stake: 10 }),
      makePendingBet({ stake: 10 }),
    ];
    const stats = runHook(bets);

    expect(stats.totalPicks).toBe(3);
    expect(stats.wins).toBe(1);
    expect(stats.pending).toBe(2);
  });

  it("sin picks pendientes: pendingStake es cero (la UI oculta el hint)", () => {
    const bets = [makeSettledBet({ result: "W", stake: 10, odds: 2.0, pnl: 10 })];
    const stats = runHook(bets);

    expect(stats.pendingStake).toBe(0);
  });

  // ── Período activo no interfiere con pendingStake ────────────────────────

  it("activePeriodOpeningBalance cambia initialBankroll pero NO altera pendingStake ni currentBankroll", () => {
    const bets = [makePendingBet({ stake: 15 })];
    const statsWithPeriod = runHook(bets, undefined, 500);
    const statsWithoutPeriod = runHook(bets, undefined, null);

    // pendingStake es el mismo independientemente del período
    expect(statsWithPeriod.pendingStake).toBe(15);
    expect(statsWithoutPeriod.pendingStake).toBe(15);

    // initialBankroll SÍ cambia con el período activo
    expect(statsWithPeriod.initialBankroll).toBe(500);
    expect(statsWithoutPeriod.initialBankroll).toBe(INITIAL_BANKROLL);

    // currentBankroll no depende del initialBankroll, sino de baseBankroll
    expect(statsWithPeriod.currentBankroll).toBe(statsWithoutPeriod.currentBankroll);
  });
});
