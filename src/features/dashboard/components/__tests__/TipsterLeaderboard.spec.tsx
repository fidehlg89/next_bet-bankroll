import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TipsterLeaderboard } from "../TipsterLeaderboard";
import type { TipsterStat } from "@/features/bets/types/bet.types";
import { useTipsterSettingsStore } from "@/store/tipster-settings";

const mockTipsters: TipsterStat[] = [
  {
    tipster: "ProPicks",
    picks: 50,
    profit: 450.0,
    yield: 18.5,
    winRate: 65.0,
    activeDays: 30,
    staked: 2432.4,
    avgOdds: 1.95,
  },
  {
    tipster: "RetiredTipster",
    picks: 20,
    profit: -100.0,
    yield: -5.0,
    winRate: 45.0,
    activeDays: 12,
    staked: 2000,
    avgOdds: 1.8,
  },
];

describe("TipsterLeaderboard", () => {
  beforeEach(() => {
    useTipsterSettingsStore.setState({ inactiveTipsters: [] });
  });

  it("renders empty state message when data is empty", () => {
    render(<TipsterLeaderboard data={[]} />);

    expect(screen.getByText("Top tipsters")).toBeInTheDocument();
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });

  it("renders tipsters leaderboard with formatted figures", () => {
    render(<TipsterLeaderboard data={mockTipsters} />);

    expect(screen.getByText("ProPicks")).toBeInTheDocument();
    expect(screen.getByText("RetiredTipster")).toBeInTheDocument();
    expect(screen.getByText(/450,00/)).toBeInTheDocument();
    expect(screen.getByText("+18.50%")).toBeInTheDocument();
    expect(screen.getByText("65.0%")).toBeInTheDocument();
  });

  it("applies muted text style to inactive tipsters", () => {
    useTipsterSettingsStore.setState({ inactiveTipsters: ["RetiredTipster"] });

    render(<TipsterLeaderboard data={mockTipsters} />);

    const retiredCell = screen.getByText("RetiredTipster");
    expect(retiredCell.className).toContain("text-muted-foreground");

    const activeCell = screen.getByText("ProPicks");
    expect(activeCell.className).not.toContain("text-muted-foreground");
  });
});
