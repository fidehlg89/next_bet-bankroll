import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fEUR, fPct, pnlClass } from "@/shared/lib/formatters";
import type { MarketStat } from "@/features/bets/types/bet.types";

export function MarketTable({ data }: { data: MarketStat[] }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h3 className="font-display text-base font-semibold">Rendimiento por mercado</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>Mercado</TableHead>
            <TableHead className="text-right">Picks</TableHead>
            <TableHead className="text-right">WR%</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">Yield</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">Sin datos</TableCell></TableRow>
          )}
          {data.map((m) => (
            <TableRow key={m.market} className="border-border">
              <TableCell className="font-medium">{m.market}</TableCell>
              <TableCell className="text-right font-mono-num">{m.picks}</TableCell>
              <TableCell className="text-right font-mono-num">{m.winRate.toFixed(1)}%</TableCell>
              <TableCell className={`text-right font-mono-num ${pnlClass(m.profit)}`}>{fEUR(m.profit)}</TableCell>
              <TableCell className={`text-right font-mono-num ${pnlClass(m.yield)}`}>{fPct(m.yield)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}