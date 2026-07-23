import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fEUR, fPct, pnlClass } from "@/shared/lib/formatters";
import type { TipsterStat } from "@/features/bets/types/bet.types";
import { useTipsterSettingsStore } from "@/store/tipster-settings";

export function TipsterLeaderboard({ data }: { data: TipsterStat[] }) {
  const inactiveTipsters = useTipsterSettingsStore((state) => state.inactiveTipsters);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h3 className="font-display text-base font-semibold">Top tipsters</h3>
      </div>
      <div className="overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Tipster</TableHead>
              <TableHead className="text-right">Días</TableHead>
              <TableHead className="text-right">P&amp;L</TableHead>
              <TableHead className="text-right">Yield</TableHead>
              <TableHead className="text-right">WR%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                  Sin datos
                </TableCell>
              </TableRow>
            )}
            {data.map((t) => (
              <TableRow key={t.tipster} className="border-border">
                <TableCell
                  className={`font-medium ${inactiveTipsters.includes(t.tipster) ? "text-muted-foreground" : ""}`}
                >
                  {t.tipster}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{t.activeDays}</TableCell>
                <TableCell className={`text-right font-mono-num ${pnlClass(t.profit)}`}>
                  {fEUR(t.profit)}
                </TableCell>
                <TableCell className={`text-right font-mono-num ${pnlClass(t.yield)}`}>
                  {fPct(t.yield)}
                </TableCell>
                <TableCell className="text-right font-mono-num">{t.winRate.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
