import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BetSummary } from "../BetSummary";
import type { Bet } from "@/features/bets/types/bet.types";

const mockBets: Bet[] = [
  {
    id: "b1",
    created_at: "2025-01-01T00:00:00Z",
    user_id: "u1",
    bet_date: "2025-01-10",
    tipster: "TipsterA",
    market: "Football",
    stake: 100,
    odds: 2.0,
    result: "W",
    pnl: 100,
  },
  {
    id: "b2",
    created_at: "2025-01-01T00:00:00Z",
    user_id: "u1",
    bet_date: "2025-01-11",
    tipster: "TipsterA",
    market: "Football",
    stake: 50,
    odds: 1.9,
    result: "L",
    pnl: -50,
  },
  {
    id: "b3",
    created_at: "2025-01-01T00:00:00Z",
    user_id: "u1",
    bet_date: "2025-01-12",
    tipster: "TipsterB",
    market: "Basketball",
    stake: 25,
    odds: 2.1,
    result: "pending",
  },
];

describe("BetSummary", () => {
  it("returns null when bets array is empty or undefined", () => {
    const { container } = render(<BetSummary bets={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("calculates totals, pending picks, total stake, profit, and yield correctly", () => {
    render(<BetSummary bets={mockBets} />);

    expect(screen.getByText("Picks:")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // Wins/Losses/Pushes/Pending
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("(1 pendientes)")).toBeInTheDocument();

    // Total stake = 100 + 50 + 25 = 175
    expect(screen.getByText(/175,00/)).toBeInTheDocument();

    // Total profit = 100 - 50 = +50
    expect(screen.getByText(/50,00/)).toBeInTheDocument();

    // Yield = 50 / (100 + 50) * 100 = 33.33%
    expect(screen.getByText("+33.33%")).toBeInTheDocument();
  });
});
