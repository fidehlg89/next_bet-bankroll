/**
 * Monthly Periods Service
 * Handles all direct Supabase interactions for the monthly_periods table.
 * Called by hooks — never from client components directly.
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  MonthlyPeriod,
  MonthlyPeriodInsert,
  ClosePeriodInput,
  MonthlyPeriodEnriched,
  UpdatePeriodInput,
} from "../types/period.types";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns the first day of the given month as an ISO date string (YYYY-MM-DD) */
export function toFirstOfMonth(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d.toISOString().split("T")[0];
}

/** Enriches a raw DB row with derived status, profit, and yield fields */
function enrichPeriod(
  p: MonthlyPeriod,
  txs: { type: string; amount: number; transaction_date: string }[],
): MonthlyPeriodEnriched {
  const periodDate = new Date(p.period_month);
  const pYear = periodDate.getFullYear();
  const pMonth = periodDate.getMonth();

  let total_deposits = 0;
  let total_withdrawals = 0;

  txs.forEach((tx) => {
    const txDate = new Date(tx.transaction_date);
    if (txDate.getFullYear() === pYear && txDate.getMonth() === pMonth) {
      if (tx.type === "deposit") total_deposits += tx.amount;
      if (tx.type === "withdrawal") total_withdrawals += tx.amount;
    }
  });

  const isClosed = p.closing_balance !== null && p.closed_at !== null;
  const profit = isClosed
    ? parseFloat(
        (p.closing_balance! - (p.opening_balance + total_deposits - total_withdrawals)).toFixed(2),
      )
    : null;

  const invested = p.opening_balance + total_deposits;
  const yieldPct =
    profit !== null && invested > 0 ? parseFloat(((profit / invested) * 100).toFixed(2)) : null;

  return {
    ...p,
    status: isClosed ? "closed" : "open",
    profit,
    yield: yieldPct,
    total_deposits,
    total_withdrawals,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────

async function fetchUserTransactions() {
  const { data: txs, error: txsError } = await supabase
    .from("bankroll_transactions")
    .select("type, amount, transaction_date")
    .in("type", ["deposit", "withdrawal"]);

  if (txsError) throw txsError;
  return txs ?? [];
}

/**
 * Fetches all monthly periods for the authenticated user,
 * ordered from newest to oldest.
 */
export async function fetchMonthlyPeriods(): Promise<MonthlyPeriodEnriched[]> {
  const { data, error } = await supabase
    .from("monthly_periods")
    .select("*")
    .order("period_month", { ascending: false });

  if (error) throw error;

  const txs = await fetchUserTransactions();
  return (data ?? []).map((p) => enrichPeriod(p, txs));
}

/**
 * Returns the currently open period (closing_balance IS NULL).
 * Returns null if no period is open yet.
 */
export async function fetchActivePeriod(): Promise<MonthlyPeriodEnriched | null> {
  const { data, error } = await supabase
    .from("monthly_periods")
    .select("*")
    .is("closing_balance", null)
    .order("period_month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const txs = await fetchUserTransactions();
  return enrichPeriod(data, txs);
}

// ── Mutations ─────────────────────────────────────────────────────────────

/**
 * Opens a new monthly period. Throws if a period for that month already exists.
 */
export async function openMonthlyPeriod(input: MonthlyPeriodInsert): Promise<MonthlyPeriod> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("monthly_periods")
    .insert({
      user_id: user.id,
      period_month: input.period_month,
      opening_balance: input.opening_balance,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Closes the given period by setting closing_balance and closed_at.
 * Also optionally updates the notes field.
 */
export async function closeMonthlyPeriod(input: ClosePeriodInput): Promise<MonthlyPeriod> {
  const { data, error } = await supabase
    .from("monthly_periods")
    .update({
      closing_balance: input.closing_balance,
      closed_at: new Date().toISOString(),
      notes: input.notes ?? null,
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates a period's details (e.g. for correcting manual errors).
 */
export async function updateMonthlyPeriod(input: UpdatePeriodInput): Promise<MonthlyPeriod> {
  const payload: Record<string, unknown> = {};
  if (input.period_month !== undefined) payload.period_month = input.period_month;
  if (input.opening_balance !== undefined) payload.opening_balance = input.opening_balance;
  if (input.closing_balance !== undefined) payload.closing_balance = input.closing_balance;
  if (input.notes !== undefined) payload.notes = input.notes;

  const { data, error } = await supabase
    .from("monthly_periods")
    .update(payload)
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes a monthly period.
 */
export async function deleteMonthlyPeriod(id: string): Promise<void> {
  const { error } = await supabase.from("monthly_periods").delete().eq("id", id);

  if (error) throw error;
}
