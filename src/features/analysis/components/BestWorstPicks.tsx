import type { Bet } from "@/features/bets/types/bet.types";
import { fDate, fEUR, fOdds, pnlClass } from "@/shared/lib/formatters";

function PickList({ title, bets, accent }: { title: string; bets: Bet[]; accent: "pos" | "neg" | "gold" }) {
  const cls = accent === "pos" ? "text-pos" : accent === "neg" ? "text-neg" : "text-pending";
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h3 className={`font-display text-base font-semibold ${cls}`}>{title}</h3>
      </div>
      <ul className="divide-y divide-border">
        {bets.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">Sin datos</li>}
        {bets.map((b) => (
          <li key={b.id} className="flex items-center gap-3 px-5 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <div className="truncate">{b.event ?? b.pick ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{fDate(b.bet_date)} · {b.tipster} · {b.market}</div>
            </div>
            <div className="font-mono-num text-xs text-muted-foreground">{fOdds(b.odds)}</div>
            <div className={`w-20 text-right font-mono-num font-medium ${pnlClass(b.pnl)}`}>{fEUR(Number(b.pnl ?? 0))}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BestWorstPicks({ best, worst, bestOdds }: { best: Bet[]; worst: Bet[]; bestOdds: Bet[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <PickList title="Mejores picks" bets={best} accent="pos" />
      <PickList title="Peores picks" bets={worst} accent="neg" />
      <PickList title="Mejor cuota ganada" bets={bestOdds} accent="gold" />
    </div>
  );
}