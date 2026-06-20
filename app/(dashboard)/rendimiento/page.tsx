"use client";

import {
  useTipsterMonthly,
  useDailyPnLByTipster,
  useResultDistribution,
} from "@/features/performance/hooks/usePerformance";
import { TipsterMonthlyTable } from "@/features/performance/components/TipsterMonthly";
import { DailyPnLChart } from "@/features/performance/components/DailyPnLChart";
import { ResultDistributionChart } from "@/features/performance/components/ResultDistributionChart";
import { useTipsterStats } from "@/features/dashboard/hooks/useDashboardStats";
import { TipsterLeaderboard } from "@/features/dashboard/components/TipsterLeaderboard";

export default function RendimientoPage() {
  const { data: rows = [] } = useTipsterMonthly();
  const { data: chart } = useDailyPnLByTipster();
  const { data: tipsters = [] } = useTipsterStats();
  const { data: distribution = [] } = useResultDistribution();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Rendimiento
        </h1>
        <p className="text-sm text-muted-foreground">
          Desempeño detallado por tipster.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <DailyPnLChart
          points={chart?.points ?? []}
          tipsters={chart?.tipsters ?? []}
        />
        <ResultDistributionChart data={distribution} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TipsterMonthlyTable rows={rows} />
        <TipsterLeaderboard data={tipsters} />
      </div>
    </div>
  );
}
