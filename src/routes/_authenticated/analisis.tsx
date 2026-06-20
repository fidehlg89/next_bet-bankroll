import { createFileRoute } from "@tanstack/react-router";
import { useBets } from "@/features/bets/hooks/useBets";
import { useBestWorst, useMonthlyAnalysis } from "@/features/analysis/hooks/useMonthlyAnalysis";
import { useBetStats } from "@/features/bets/hooks/useBetStats";
import { MonthlyStats } from "@/features/analysis/components/MonthlyStats";
import { BestWorstPicks } from "@/features/analysis/components/BestWorstPicks";
import { WinStreak } from "@/features/analysis/components/WinStreak";
import { StatCard } from "@/shared/components/StatCard";
import { fEUR } from "@/shared/lib/formatters";

export const Route = createFileRoute("/_authenticated/analisis")({
  head: () => ({ meta: [{ title: "Análisis — BankrollOS" }] }),
  component: AnalisisPage,
});

function AnalisisPage() {
  const { data: bets = [] } = useBets();
  const rows = useMonthlyAnalysis(bets);
  const { best, worst, bestOdds } = useBestWorst(bets);
  const stats = useBetStats(bets);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Análisis</h1>
        <p className="text-sm text-muted-foreground">Desempeño por mes y picks destacados.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <WinStreak streak={stats.currentStreak} />
        <StatCard label="Mejor pick" value={fEUR(stats.bestWin)} tone="pos" />
        <StatCard label="Peor pick" value={fEUR(stats.worstLoss)} tone="neg" />
        <StatCard label="Cuota media" value={stats.avgOdds.toFixed(3)} hint={`Stake medio ${fEUR(stats.avgStake)}`} />
      </div>

      <MonthlyStats rows={rows} />
      <BestWorstPicks best={best} worst={worst} bestOdds={bestOdds} />
    </div>
  );
}