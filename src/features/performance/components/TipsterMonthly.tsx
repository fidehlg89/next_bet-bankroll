import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fEUR, fMonth, fPct, pnlClass } from "@/shared/lib/formatters";
import type { TipsterMonthlyRow } from "../hooks/usePerformance";

export function TipsterMonthlyTable({ rows }: { rows: TipsterMonthlyRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h3 className="font-display text-base font-semibold">Tipster × Mes</h3>
      </div>
      <div className="overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Tipster</TableHead>
              <TableHead>Mes</TableHead>
              <TableHead className="text-right">Picks</TableHead>
              <TableHead className="text-right">WR%</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Yield</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                  Sin datos
                </TableCell>
              </TableRow>
            )}
            {rows.map((r, i) => (
              <TableRow key={`${r.tipster}-${r.month}-${i}`} className="border-border">
                <TableCell className="font-medium">{r.tipster}</TableCell>
                <TableCell className="text-sm text-muted-foreground capitalize">
                  {fMonth(r.month)}
                </TableCell>
                <TableCell className="text-right font-mono-num">{r.picks}</TableCell>
                <TableCell className="text-right font-mono-num">{r.winRate.toFixed(1)}%</TableCell>
                <TableCell className={`text-right font-mono-num ${pnlClass(r.profit)}`}>
                  {fEUR(r.profit)}
                </TableCell>
                <TableCell className={`text-right font-mono-num ${pnlClass(r.yield)}`}>
                  {fPct(r.yield)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
