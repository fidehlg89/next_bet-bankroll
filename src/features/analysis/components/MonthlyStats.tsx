import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fEUR, fMonth, fPct, pnlClass } from "@/shared/lib/formatters";
import type { MonthlyRow } from "../hooks/useMonthlyAnalysis";

export function MonthlyStats({ rows }: { rows: MonthlyRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h3 className="font-display text-base font-semibold">Resumen mensual</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>Mes</TableHead>
            <TableHead className="text-right">Picks</TableHead>
            <TableHead className="text-right">W</TableHead>
            <TableHead className="text-right">L</TableHead>
            <TableHead className="text-right">WR%</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">Yield</TableHead>
            <TableHead className="text-right">Bankroll</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">Sin datos</TableCell></TableRow>
          )}
          {rows.map((r) => (
            <TableRow key={r.month} className="border-border">
              <TableCell className="font-medium capitalize">{fMonth(`${r.month}-01`)}</TableCell>
              <TableCell className="text-right font-mono-num">{r.picks}</TableCell>
              <TableCell className="text-right font-mono-num text-pos">{r.wins}</TableCell>
              <TableCell className="text-right font-mono-num text-neg">{r.losses}</TableCell>
              <TableCell className="text-right font-mono-num">{r.winRate.toFixed(1)}%</TableCell>
              <TableCell className={`text-right font-mono-num ${pnlClass(r.profit)}`}>{fEUR(r.profit)}</TableCell>
              <TableCell className={`text-right font-mono-num ${pnlClass(r.yield)}`}>{fPct(r.yield)}</TableCell>
              <TableCell className="text-right font-mono-num">{fEUR(r.bankroll)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}