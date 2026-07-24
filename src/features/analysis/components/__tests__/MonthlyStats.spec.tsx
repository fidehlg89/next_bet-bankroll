import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MonthlyStats } from "../MonthlyStats";
import type { MonthlyRow } from "../hooks/useMonthlyAnalysis";

const mockRows: MonthlyRow[] = [
  {
    month: "2025-01",
    picks: 15,
    wins: 10,
    losses: 5,
    pushes: 0,
    winRate: 66.67,
    profit: 320.5,
    yield: 12.8,
    bankroll: 1320.5,
  },
];

describe("MonthlyStats", () => {
  it("renders empty state message when rows array is empty", () => {
    render(<MonthlyStats rows={[]} />);

    expect(screen.getByText("Resumen mensual")).toBeInTheDocument();
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });

  it("renders monthly rows formatted properly", () => {
    render(<MonthlyStats rows={mockRows} />);

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("66.7%")).toBeInTheDocument();
    expect(screen.getByText(/^320,50/)).toBeInTheDocument();
    expect(screen.getByText("+12.80%")).toBeInTheDocument();
  });
});
