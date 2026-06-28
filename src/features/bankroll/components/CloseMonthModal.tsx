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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fEUR, fPct } from "@/shared/lib/formatters";
import { useCloseMonthlyPeriod } from "@/features/bankroll/hooks/useMonthlyPeriods";
import type { MonthlyPeriodEnriched } from "@/features/bankroll/types/period.types";
import { CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

// ── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  closing_balance: z.coerce.number().min(0, "Value cannot be negative"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Props ───────────────────────────────────────────────────────────────────

interface CloseMonthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The currently active period */
  period: MonthlyPeriodEnriched;
  /** Current bankroll (opening_balance + profit from bets so far this month) */
  currentBankroll: number;
  /** Total profit from bets in this period */
  periodProfit: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPeriodLabel(periodMonth: string): string {
  const d = new Date(periodMonth + "T12:00:00");
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

// ── Component ────────────────────────────────────────────────────────────────

export function CloseMonthModal({
  open,
  onOpenChange,
  period,
  currentBankroll,
  periodProfit,
}: CloseMonthModalProps) {
  const { mutateAsync: closePeriod, isPending } = useCloseMonthlyPeriod();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      closing_balance: currentBankroll,
      notes: "",
    },
  });

  // Sync default values when the modal opens or currentBankroll changes
  useEffect(() => {
    if (open) {
      form.reset({
        closing_balance: currentBankroll,
        notes: "",
      });
    }
  }, [open, currentBankroll, form]);

  const watchedClosing = form.watch("closing_balance");
  const delta =
    typeof watchedClosing === "number"
      ? parseFloat((watchedClosing - period.opening_balance).toFixed(2))
      : 0;
  const yieldPct =
    period.opening_balance > 0
      ? parseFloat(((delta / period.opening_balance) * 100).toFixed(2))
      : 0;

  const isPositive = delta >= 0;

  const onSubmit = async (values: FormValues) => {
    try {
      await closePeriod({
        id: period.id,
        closing_balance: values.closing_balance,
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
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Close {formatPeriodLabel(period.period_month)}
          </DialogTitle>
        </DialogHeader>

        {/* Period Summary */}
        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Period Summary
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Opening balance</p>
              <p className="font-semibold">{fEUR(period.opening_balance)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Period profit (bets)</p>
              <p
                className={`font-semibold ${periodProfit >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {periodProfit >= 0 ? "+" : ""}
                {fEUR(periodProfit)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="closing_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing balance (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  {/* Live delta preview */}
                  {typeof watchedClosing === "number" && (
                    <div
                      className={`flex items-center gap-1.5 text-xs font-medium ${
                        isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {isPositive ? "+" : ""}
                      {fEUR(delta)} · {isPositive ? "+" : ""}
                      {fPct(yieldPct)} yield this period
                    </div>
                  )}
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
                    <Input placeholder="e.g. Good month, hit the ROI target" {...field} />
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
                {isPending ? "Saving…" : "Close Month"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
