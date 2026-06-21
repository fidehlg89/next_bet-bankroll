"use client";

import type { Metadata } from "next";
import { useBets } from "@/features/bets/hooks/useBets";
import { useBankrollTransactions } from "@/features/bets/hooks/useBankrollTransactions";
import { useBetStats } from "@/features/bets/hooks/useBetStats";
import { KpiCards } from "@/features/dashboard/components/KpiCards";
import { BankrollAdjustmentModal } from "@/features/dashboard/components/BankrollAdjustmentModal";
import { BankrollChart } from "@/features/dashboard/components/BankrollChart";
import { MarketTable } from "@/features/dashboard/components/MarketTable";
import { TipsterLeaderboard } from "@/features/dashboard/components/TipsterLeaderboard";
import {
  useBankrollDaily,
  useMarketStats,
  useTipsterStats,
} from "@/features/dashboard/hooks/useDashboardStats";

export default function DashboardPage() {
  const { data: bets = [] } = useBets();
  const { data: transactions = [] } = useBankrollTransactions();
  const stats = useBetStats(bets, transactions);
  const { data: market = [] } = useMarketStats();
  const { data: tipsters = [] } = useTipsterStats();
  const { data: bankroll = [] } = useBankrollDaily();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visión general de tu banca.</p>
        </div>
        <BankrollAdjustmentModal currentBankroll={stats.currentBankroll} />
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
