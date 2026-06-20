import { createFileRoute } from "@tanstack/react-router";
import { useBets } from "@/features/bets/hooks/useBets";
import { useBetStats, INITIAL_BANKROLL } from "@/features/bets/hooks/useBetStats";
import { KpiCards } from "@/features/dashboard/components/KpiCards";
import { BankrollChart } from "@/features/dashboard/components/BankrollChart";
import { MarketTable } from "@/features/dashboard/components/MarketTable";
import { TipsterLeaderboard } from "@/features/dashboard/components/TipsterLeaderboard";
import { useBankrollDaily, useMarketStats, useTipsterStats } from "@/features/dashboard/hooks/useDashboardStats";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Dashboard — BankrollOS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: bets = [] } = useBets();
  const stats = useBetStats(bets);
  const { data: market = [] } = useMarketStats();
  const { data: tipsters = [] } = useTipsterStats();
  const { data: bankroll = [] } = useBankrollDaily(INITIAL_BANKROLL);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visión general de tu banca.</p>
      </div>
      <KpiCards stats={stats} />
      <BankrollChart data={bankroll} />
      <div className="grid gap-4 md:grid-cols-2">
        <MarketTable data={market} />
        <TipsterLeaderboard data={tipsters.slice(0, 8)} />
      </div>
    </div>
  );
}