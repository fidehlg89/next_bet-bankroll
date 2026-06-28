/**
 * React Query hooks for the Monthly Periods feature.
 * All mutations show toast feedback and invalidate relevant query keys.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchMonthlyPeriods,
  fetchActivePeriod,
  openMonthlyPeriod,
  closeMonthlyPeriod,
  updateMonthlyPeriod,
  deleteMonthlyPeriod,
  toFirstOfMonth,
} from "../services/monthlyPeriods.service";
import type {
  MonthlyPeriodInsert,
  ClosePeriodInput,
  UpdatePeriodInput,
} from "../types/period.types";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const periodKeys = {
  all: ["monthly-periods"] as const,
  active: ["monthly-periods", "active"] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

/** Returns all periods ordered newest → oldest */
export function useMonthlyPeriods() {
  return useQuery({
    queryKey: periodKeys.all,
    queryFn: fetchMonthlyPeriods,
  });
}

/** Returns the currently open period, or null if none exists */
export function useActivePeriod() {
  return useQuery({
    queryKey: periodKeys.active,
    queryFn: fetchActivePeriod,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

/** Opens a new monthly period */
export function useOpenMonthlyPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MonthlyPeriodInsert) => openMonthlyPeriod(input),
    onSuccess: () => {
      toast.success("New period opened");
      qc.invalidateQueries({ queryKey: periodKeys.all });
      qc.invalidateQueries({ queryKey: periodKeys.active });
      // Dashboard bankroll stats may reflect the new opening balance
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
    },
    onError: (err: Error) => {
      toast.error(`Error opening period: ${err.message}`);
    },
  });
}

/** Closes the active monthly period */
export function useCloseMonthlyPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ClosePeriodInput) => closeMonthlyPeriod(input),
    onSuccess: () => {
      toast.success("Period closed successfully");
      qc.invalidateQueries({ queryKey: periodKeys.all });
      qc.invalidateQueries({ queryKey: periodKeys.active });
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
    },
    onError: (err: Error) => {
      toast.error(`Error closing period: ${err.message}`);
    },
  });
}

/** Updates a period's details (correction) */
export function useUpdateMonthlyPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePeriodInput) => updateMonthlyPeriod(input),
    onSuccess: () => {
      toast.success("Period updated");
      qc.invalidateQueries({ queryKey: periodKeys.all });
      qc.invalidateQueries({ queryKey: periodKeys.active });
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
    },
    onError: (err: Error) => {
      toast.error(`Error updating period: ${err.message}`);
    },
  });
}

/** Deletes a period */
export function useDeleteMonthlyPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMonthlyPeriod(id),
    onSuccess: () => {
      toast.success("Period deleted");
      qc.invalidateQueries({ queryKey: periodKeys.all });
      qc.invalidateQueries({ queryKey: periodKeys.active });
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
    },
    onError: (err: Error) => {
      toast.error(`Error deleting period: ${err.message}`);
    },
  });
}

/**
 * Convenience hook that:
 * 1. Closes the current active period with the provided closing_balance.
 * 2. Immediately opens the next calendar month with the provided opening_balance.
 *
 * Both operations run sequentially (close first, then open).
 */
export function useCloseAndOpenNextPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      currentPeriodId,
      closing_balance,
      next_opening_balance,
      closeNotes,
      openNotes,
    }: {
      currentPeriodId: string;
      closing_balance: number;
      next_opening_balance: number;
      closeNotes?: string | null;
      openNotes?: string | null;
    }) => {
      // 1. Close current period
      await closeMonthlyPeriod({
        id: currentPeriodId,
        closing_balance,
        notes: closeNotes,
      });

      // 2. Compute next month's first day
      const nextMonth = new Date();
      nextMonth.setDate(1);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // 3. Open next period
      await openMonthlyPeriod({
        period_month: toFirstOfMonth(nextMonth),
        opening_balance: next_opening_balance,
        notes: openNotes,
      });
    },
    onSuccess: () => {
      toast.success("Month closed and new period opened");
      qc.invalidateQueries({ queryKey: periodKeys.all });
      qc.invalidateQueries({ queryKey: periodKeys.active });
      qc.invalidateQueries({ queryKey: ["dashboard", "bankroll"] });
    },
    onError: (err: Error) => {
      toast.error(`Error: ${err.message}`);
    },
  });
}
