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
} from "../types/period.types";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns the first day of the given month as an ISO date string (YYYY-MM-DD) */
export function toFirstOfMonth(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d.toISOString().split("T")[0];
}

/** Enriches a raw DB row with derived status, profit, and yield fields */
function enrichPeriod(p: MonthlyPeriod): MonthlyPeriodEnriched {
  const isClosed = p.closing_balance !== null && p.closed_at !== null;
  const profit = isClosed ? parseFloat((p.closing_balance! - p.opening_balance).toFixed(2)) : null;
  const yieldPct =
    profit !== null && p.opening_balance > 0
      ? parseFloat(((profit / p.opening_balance) * 100).toFixed(2))
      : null;

  return {
    ...p,
    status: isClosed ? "closed" : "open",
    profit,
    yield: yieldPct,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────

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
  return (data ?? []).map(enrichPeriod);
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
  return data ? enrichPeriod(data) : null;
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
 * Updates a period's opening balance and/or notes.
 * Useful for corrections without closing/reopening the period.
 */
export async function updatePeriodOpeningBalance(
  id: string,
  opening_balance: number,
  notes?: string | null,
): Promise<MonthlyPeriod> {
  const { data, error } = await supabase
    .from("monthly_periods")
    .update({ opening_balance, notes: notes ?? null })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
