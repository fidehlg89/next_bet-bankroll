"use client";

import { useState } from "react";
import {
  useMonthlyPeriods,
  useUpdatePeriodOpeningBalance,
} from "@/features/bankroll/hooks/useMonthlyPeriods";
import { OpenPeriodModal } from "./OpenPeriodModal";
import { fEUR, fPct } from "@/shared/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarPlus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MonthlyPeriodEnriched } from "@/features/bankroll/types/period.types";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatMonth(periodMonth: string): string {
  const d = new Date(periodMonth + "T12:00:00");
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

function ProfitCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const isPos = value >= 0;
  return (
    <span
      className={`flex items-center gap-1 font-medium ${isPos ? "text-green-500" : "text-red-500"}`}
    >
      {isPos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {isPos ? "+" : ""}
      {fEUR(value)}
    </span>
  );
}

function YieldCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const isPos = value >= 0;
  return (
    <span className={`font-medium ${isPos ? "text-green-500" : "text-red-500"}`}>
      {isPos ? "+" : ""}
      {fPct(value)}
    </span>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function MonthlyPeriodsTable() {
  const { data: periods = [], isLoading } = useMonthlyPeriods();
  const [openModalOpen, setOpenModalOpen] = useState(false);

  // Suggest new opening balance = latest closed period's closing balance
  const latestClosed = periods.find((p) => p.status === "closed");
  const suggestedOpening = latestClosed?.closing_balance ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Monthly Periods</h3>
          <p className="text-xs text-muted-foreground">History of your bankroll across periods</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpenModalOpen(true)}>
          <CalendarPlus className="h-4 w-4 mr-1.5" />
          New Period
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
      ) : periods.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No periods recorded yet. Open your first period to start tracking monthly performance.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Opening</TableHead>
                <TableHead className="text-right">Closing</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Yield</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell className="font-medium capitalize">
                    {formatMonth(period.period_month)}
                  </TableCell>
                  <TableCell className="text-right">{fEUR(period.opening_balance)}</TableCell>
                  <TableCell className="text-right">
                    {period.closing_balance !== null ? (
                      fEUR(period.closing_balance)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ProfitCell value={period.profit} />
                  </TableCell>
                  <TableCell className="text-right">
                    <YieldCell value={period.yield} />
                  </TableCell>
                  <TableCell className="text-center">
                    {period.status === "open" ? (
                      <Badge
                        variant="outline"
                        className="text-green-500 border-green-500/30 text-xs"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Closed
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <OpenPeriodModal
        open={openModalOpen}
        onOpenChange={setOpenModalOpen}
        suggestedOpeningBalance={suggestedOpening}
      />
    </div>
  );
}
