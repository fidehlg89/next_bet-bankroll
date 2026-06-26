"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fEUR } from "@/shared/lib/formatters";
import { useOpenMonthlyPeriod } from "@/features/bankroll/hooks/useMonthlyPeriods";
import { toFirstOfMonth } from "@/features/bankroll/services/monthlyPeriods.service";
import { CalendarPlus } from "lucide-react";

// ── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  period_month: z.string().min(1, "Month is required"),
  opening_balance: z.coerce.number().min(0, "Value cannot be negative"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Props ───────────────────────────────────────────────────────────────────

interface OpenPeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill the opening balance (e.g. from previous period's closing balance) */
  suggestedOpeningBalance?: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the first day of the next calendar month in YYYY-MM format (for <input type="month">) */
function nextMonthValue(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 7); // "YYYY-MM"
}

/** Returns current month value in YYYY-MM */
function currentMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}

// ── Component ────────────────────────────────────────────────────────────────

export function OpenPeriodModal({
  open,
  onOpenChange,
  suggestedOpeningBalance = 0,
}: OpenPeriodModalProps) {
  const { mutateAsync: openPeriod, isPending } = useOpenMonthlyPeriod();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      period_month: currentMonthValue(),
      opening_balance: suggestedOpeningBalance,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        period_month: currentMonthValue(),
        opening_balance: suggestedOpeningBalance,
        notes: "",
      });
    }
  }, [open, suggestedOpeningBalance, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert "YYYY-MM" to "YYYY-MM-01" (first of the month)
      const period_month = values.period_month + "-01";
      await openPeriod({
        period_month,
        opening_balance: values.opening_balance,
        notes: values.notes || null,
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Open New Period
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="period_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="opening_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening balance (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>Include any capital you are adding this month.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Added 140 € from savings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Opening…" : "Open Period"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
