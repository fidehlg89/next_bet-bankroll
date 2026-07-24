import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KpiCards } from "../KpiCards";
import type { BetStats } from "@/features/bets/types/bet.types";

vi.mock("@/features/dashboard/components/BankrollAdjustmentModal", () => ({
  BankrollAdjustmentModal: () => <button>Ajustar</button>,
}));

vi.mock("@/features/dashboard/components/InitialBankrollModal", () => ({
  InitialBankrollModal: () => <button>Editar</button>,
}));

const mockStats: BetStats = {
  initialBankroll: 1000,
  currentBankroll: 1250,
  profit: 250,
  yield: 12.5,
  winRate: 62.5,
  totalBets: 20,
  wins: 10,
  losses: 6,
  pushes: 2,
  pending: 2,
  pendingStake: 50,
  roi: 25,
  avgOdds: 1.85,
  avgStake: 25,
  totalStaked: 500,
};

function renderKpiCards(stats: BetStats = mockStats) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <KpiCards stats={stats} />
    </QueryClientProvider>,
  );
}

describe("KpiCards", () => {
  it("renders all 4 main KPI cards with correct labels and formatted values", () => {
    renderKpiCards();

    expect(screen.getByText("Bankroll")).toBeInTheDocument();
    expect(screen.getByText(/1250,00/)).toBeInTheDocument();

    expect(screen.getByText("Profit")).toBeInTheDocument();
    expect(screen.getByText(/^250,00/)).toBeInTheDocument();
    expect(screen.getByText("10W · 6L · 2P")).toBeInTheDocument();

    expect(screen.getByText("Win Rate")).toBeInTheDocument();
    expect(screen.getByText("62.50 %")).toBeInTheDocument();
    expect(screen.getByText("16 liquidados")).toBeInTheDocument();

    expect(screen.getByText("Yield")).toBeInTheDocument();
    expect(screen.getByText("+12.50%")).toBeInTheDocument();
  });

  it("renders pending stake warning when pendingStake > 0", () => {
    renderKpiCards();

    expect(screen.getByText(/En juego: 50,00 € \(2 picks\)/i)).toBeInTheDocument();
  });

  it("hides pending stake section when pendingStake is 0", () => {
    renderKpiCards({ ...mockStats, pendingStake: 0, pending: 0 });

    expect(screen.queryByText(/En juego:/i)).not.toBeInTheDocument();
  });
});
