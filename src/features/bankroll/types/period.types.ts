/**
 * Types for the monthly bankroll period feature.
 * A period covers exactly one calendar month and tracks the opening
 * and (optionally) closing bankroll balance for that month.
 */

export type PeriodStatus = "open" | "closed";

export interface MonthlyPeriod {
  id: string;
  user_id: string;
  /** ISO date string – always the 1st of the month (e.g. "2026-07-01") */
  period_month: string;
  opening_balance: number;
  /** null while the period is still active */
  closing_balance: number | null;
  notes: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyPeriodInsert {
  period_month: string;
  opening_balance: number;
  notes?: string | null;
}

export interface ClosePeriodInput {
  id: string;
  closing_balance: number;
  notes?: string | null;
}

export interface UpdatePeriodInput {
  id: string;
  period_month?: string;
  opening_balance?: number;
  closing_balance?: number | null;
  notes?: string | null;
}

/** Derived helper – enriches MonthlyPeriod with computed fields */
export interface MonthlyPeriodEnriched extends MonthlyPeriod {
  status: PeriodStatus;
  /** closing_balance - (opening_balance + total_deposits - total_withdrawals), null if still open */
  profit: number | null;
  /** profit / (opening_balance + total_deposits) * 100, null if still open */
  yield: number | null;
  total_deposits: number;
  total_withdrawals: number;
}
