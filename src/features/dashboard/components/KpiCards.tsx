import { StatCard } from "@/shared/components/StatCard";
import { fEUR, fPct } from "@/shared/lib/formatters";
import type { BetStats } from "@/features/bets/types/bet.types";
import { BankrollAdjustmentModal } from "@/features/dashboard/components/BankrollAdjustmentModal";
import { InitialBankrollModal } from "@/features/dashboard/components/InitialBankrollModal";

export function KpiCards({ stats }: { stats: BetStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        label="Bankroll"
        value={fEUR(stats.currentBankroll)}
        hint={
          <div className="flex items-center gap-2">
            <span>Inicial {fEUR(stats.initialBankroll)}</span>
            <InitialBankrollModal baseBankroll={stats.initialBankroll} />
          </div>
        }
        action={
          <BankrollAdjustmentModal
            currentBankroll={stats.currentBankroll}
            initialBankroll={stats.initialBankroll}
          />
        }
      />
      <StatCard
        label="Profit"
        value={fEUR(stats.profit)}
        tone={stats.profit >= 0 ? "pos" : "neg"}
        hint={`${stats.wins}W · ${stats.losses}L · ${stats.pushes}P`}
      />
      <StatCard
        label="Win Rate"
        value={`${stats.winRate.toFixed(2)} %`}
        hint={`${stats.wins + stats.losses} liquidados`}
      />
      <StatCard
        label="Yield"
        value={fPct(stats.yield)}
        tone={stats.yield >= 0 ? "pos" : "neg"}
        hint="Excl. Bono"
      />
    </div>
  );
}
