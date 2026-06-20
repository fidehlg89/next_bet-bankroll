import { createFileRoute } from "@tanstack/react-router";
import { useTipsterMonthly, useDailyPnLByTipster } from "@/features/performance/hooks/usePerformance";
import { TipsterMonthlyTable } from "@/features/performance/components/TipsterMonthly";
import { DailyPnLChart } from "@/features/performance/components/DailyPnLChart";
import { useTipsterStats } from "@/features/dashboard/hooks/useDashboardStats";
import { TipsterLeaderboard } from "@/features/dashboard/components/TipsterLeaderboard";

export const Route = createFileRoute("/_authenticated/rendimiento")({
  head: () => ({ meta: [{ title: "Rendimiento — BankrollOS" }] }),
  component: RendimientoPage,
});

function RendimientoPage() {
  const { data: rows = [] } = useTipsterMonthly();
  const { data: chart } = useDailyPnLByTipster();
  const { data: tipsters = [] } = useTipsterStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Rendimiento</h1>
        <p className="text-sm text-muted-foreground">Desempeño detallado por tipster.</p>
      </div>
      <DailyPnLChart points={chart?.points ?? []} tipsters={chart?.tipsters ?? []} />
      <div className="grid gap-4 md:grid-cols-2">
        <TipsterMonthlyTable rows={rows} />
        <TipsterLeaderboard data={tipsters} />
      </div>
    </div>
  );
}