import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BestWorstPicks } from "../BestWorstPicks";
import type { Bet } from "@/features/bets/types/bet.types";

const mockBet: Bet = {
  id: "b1",
  created_at: "2025-01-01T00:00:00Z",
  user_id: "u1",
  bet_date: "2025-01-10",
  tipster: "TopTipster",
  market: "Football",
  event: "Real Madrid vs Barcelona",
  pick: "Real Madrid ML",
  stake: 100,
  odds: 2.5,
  result: "W",
  pnl: 150,
  yield: 150,
};

describe("BestWorstPicks", () => {
  it("renders empty state messages when all lists are empty", () => {
    render(<BestWorstPicks best={[]} worst={[]} bestOdds={[]} />);

    expect(screen.getByText("Mejores picks")).toBeInTheDocument();
    expect(screen.getByText("Peores picks")).toBeInTheDocument();
    expect(screen.getByText("Mejor cuota ganada")).toBeInTheDocument();

    const emptyStates = screen.getAllByText("Sin datos");
    expect(emptyStates).toHaveLength(3);
  });

  it("renders bets details in their respective lists", () => {
    const worstBet: Bet = {
      ...mockBet,
      id: "b2",
      event: "Lakers vs Celtics",
      pnl: -100,
      odds: 1.9,
      result: "L",
    };

    render(<BestWorstPicks best={[mockBet]} worst={[worstBet]} bestOdds={[mockBet]} />);

    expect(screen.getAllByText("Real Madrid vs Barcelona").length).toBe(2);
    expect(screen.getByText("Lakers vs Celtics")).toBeInTheDocument();
    expect(screen.getAllByText(/150,00/).length).toBe(2);
    expect(screen.getByText(/100,00/)).toBeInTheDocument();
    expect(screen.getAllByText("2.500").length).toBe(2);
  });
});
