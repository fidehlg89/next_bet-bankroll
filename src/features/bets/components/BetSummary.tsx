import { Card, CardContent } from "@/components/ui/card";
import type { Bet } from "../types/bet.types";
import { fEUR, fPct, pnlClass } from "@/shared/lib/formatters";

interface Props {
  bets: Bet[];
}

export function BetSummary({ bets }: Props) {
  if (!bets || bets.length === 0) return null;

  const totalPicks = bets.length;
  let wins = 0;
  let losses = 0;
  let pushes = 0;
  let pending = 0;
  let totalStaked = 0;
  let stakedOnResolved = 0;
  let totalPnL = 0;

  for (const b of bets) {
    const s = Number(b.stake) || 0;
    totalStaked += s;

    if (b.result === "W") {
      wins++;
      stakedOnResolved += s;
      totalPnL += Number(b.pnl ?? 0);
    } else if (b.result === "L") {
      losses++;
      stakedOnResolved += s;
      totalPnL += Number(b.pnl ?? 0);
    } else if (b.result === "P") {
      pushes++;
      stakedOnResolved += s;
      totalPnL += Number(b.pnl ?? 0);
    } else {
      pending++;
    }
  }

  // Yield is usually calculated over the staked amount of resolved bets to avoid skewing by pending stakes.
  const yieldValue = stakedOnResolved > 0 ? (totalPnL / stakedOnResolved) * 100 : 0;

  return (
    <Card className="bg-card shadow-none">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
          <div>
            <span className="text-muted-foreground">Picks:</span>{" "}
            <span className="font-medium">{totalPicks}</span>
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-pos">{wins}</span>W -{" "}
            <span className="font-medium text-neg">{losses}</span>L -{" "}
            <span className="font-medium">{pushes}</span>P
            {pending > 0 && <span className="ml-1 text-pending">({pending} pendientes)</span>}
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Stake
            </span>
            <span className="font-medium">{fEUR(totalStaked)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Profit
            </span>
            <span className={`font-medium ${pnlClass(totalPnL)}`}>{fEUR(totalPnL)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Yield
            </span>
            <span className={`font-medium ${pnlClass(yieldValue)}`}>{fPct(yieldValue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
