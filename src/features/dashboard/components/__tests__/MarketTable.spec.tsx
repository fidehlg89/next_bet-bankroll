import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketTable } from "../MarketTable";
import type { MarketStat } from "@/features/bets/types/bet.types";

describe("MarketTable", () => {
  it("renders empty state when data array is empty", () => {
    render(<MarketTable data={[]} />);

    expect(screen.getByText("Rendimiento por mercado")).toBeInTheDocument();
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
    expect(screen.queryByText(/Total:/i)).not.toBeInTheDocument();
  });

  it("renders rows and calculates total profit correctly when data is provided", () => {
    const mockData: MarketStat[] = [
      { market: "Football", picks: 10, profit: 150.5, winRate: 60.0, yield: 15.0 },
      { market: "Basketball", picks: 5, profit: -50.0, winRate: 40.0, yield: -10.0 },
    ];

    render(<MarketTable data={mockData} />);

    // Total profit header
    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    expect(screen.getByText(/100,50/)).toBeInTheDocument();

    // Table rows
    expect(screen.getByText("Football")).toBeInTheDocument();
    expect(screen.getByText("Basketball")).toBeInTheDocument();
    expect(screen.getByText("60.0%")).toBeInTheDocument();
    expect(screen.getByText("40.0%")).toBeInTheDocument();
  });
});
