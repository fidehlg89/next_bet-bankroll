"use client";

import { useBets } from "@/features/bets/hooks/useBets";
import { useBankrollTransactions } from "@/features/bets/hooks/useBankrollTransactions";
import { useBetStats } from "@/features/bets/hooks/useBetStats";
import { useActivePeriod } from "@/features/bankroll/hooks/useMonthlyPeriods";
import { KpiCards } from "@/features/dashboard/components/KpiCards";
import { BankrollAdjustmentModal } from "@/features/dashboard/components/BankrollAdjustmentModal";
import { BankrollChart } from "@/features/dashboard/components/BankrollChart";
import { MarketTable } from "@/features/dashboard/components/MarketTable";
import { TipsterLeaderboard } from "@/features/dashboard/components/TipsterLeaderboard";
import { ActivePeriodBanner } from "@/features/bankroll/components/ActivePeriodBanner";
import { MonthlyPeriodsTable } from "@/features/bankroll/components/MonthlyPeriodsTable";
import {
  useBankrollDaily,
  useMarketStats,
  useTipsterStats,
} from "@/features/dashboard/hooks/useDashboardStats";

export default function DashboardPage() {
  const { data: bets = [] } = useBets();
  const { data: transactions = [] } = useBankrollTransactions();
  const { data: activePeriod } = useActivePeriod();

  // When a monthly period is active, its opening_balance becomes the "initial"
  // shown in the KPI so users see the current period's starting point.
  const stats = useBetStats(bets, transactions, activePeriod?.opening_balance ?? null);

  const { data: market = [] } = useMarketStats();
  const { data: tipsters = [] } = useTipsterStats();
  const { data: bankroll = [] } = useBankrollDaily();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visión general de tu banca.</p>
        </div>
        <BankrollAdjustmentModal
          currentBankroll={stats.currentBankroll}
          baseBankroll={stats.initialBankroll}
          profit={stats.profit}
        />
      </div>

      {/* Active period banner */}
      <ActivePeriodBanner
        currentBankroll={stats.currentBankroll}
        periodProfit={stats.profit}
      />

      {/* KPIs */}
      <KpiCards stats={stats} />

      {/* Bankroll chart */}
      <BankrollChart data={bankroll} />

      {/* Market + Tipsters */}
      <div className="grid gap-4 md:grid-cols-2">
        <MarketTable data={market} />
        <TipsterLeaderboard data={tipsters.slice(0, 8)} />
      </div>

      {/* Monthly periods history */}
      <MonthlyPeriodsTable />
    </div>
  );
}
