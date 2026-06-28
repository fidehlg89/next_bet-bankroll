"use client";

import { useState } from "react";
import {
  useMonthlyPeriods,
  useDeleteMonthlyPeriod,
} from "@/features/bankroll/hooks/useMonthlyPeriods";
import { OpenPeriodModal } from "./OpenPeriodModal";
import { EditPeriodModal } from "./EditPeriodModal";
import { PeriodTransactionsModal } from "./PeriodTransactionsModal";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarPlus,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
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
      className={`flex items-center justify-end gap-1 font-medium ${isPos ? "text-green-500" : "text-red-500"}`}
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
  const { mutateAsync: deletePeriod } = useDeleteMonthlyPeriod();

  const [openModalOpen, setOpenModalOpen] = useState(false);

  const [editPeriod, setEditPeriod] = useState<MonthlyPeriodEnriched | null>(null);
  const [txPeriod, setTxPeriod] = useState<MonthlyPeriodEnriched | null>(null);

  // Suggest new opening balance = latest closed period's closing balance
  const latestClosed = periods.find((p) => p.status === "closed");
  const suggestedOpening = latestClosed?.closing_balance ?? 0;

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "¿Seguro que quieres eliminar este periodo? Esta acción no se puede deshacer y afectará los saldos calculados.",
      )
    ) {
      try {
        await deletePeriod(id);
      } catch (err) {
        // error toast handled in hook
      }
    }
  };

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
        <div className="rounded-lg border overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Inicial</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Retiros</TableHead>
                <TableHead className="text-right">Final</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Yield</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell className="font-medium capitalize">
                    {formatMonth(period.period_month)}
                  </TableCell>
                  <TableCell className="text-right">{fEUR(period.opening_balance)}</TableCell>
                  <TableCell className="text-right text-green-500">
                    {period.total_deposits > 0 ? `+${fEUR(period.total_deposits)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-red-500">
                    {period.total_withdrawals > 0 ? `-${fEUR(period.total_withdrawals)}` : "—"}
                  </TableCell>
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
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Cerrado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setTxPeriod(period)}
                          className="cursor-pointer"
                        >
                          <ArrowRightLeft className="mr-2 h-4 w-4" /> Ver Transacciones
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditPeriod(period)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Editar Periodo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(period.id)}
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar Periodo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <EditPeriodModal
        open={!!editPeriod}
        onOpenChange={(open) => !open && setEditPeriod(null)}
        period={editPeriod}
      />

      <PeriodTransactionsModal
        open={!!txPeriod}
        onOpenChange={(open) => !open && setTxPeriod(null)}
        period={txPeriod}
      />
    </div>
  );
}
