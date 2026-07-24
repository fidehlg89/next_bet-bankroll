import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WinStreak } from "../WinStreak";

describe("WinStreak", () => {
  it("renders empty state when streak is 0", () => {
    render(<WinStreak streak={0} />);

    expect(screen.getByText("Racha actual")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Sin liquidados")).toBeInTheDocument();
  });

  it("renders winning streak with positive styling and text", () => {
    render(<WinStreak streak={5} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Victorias seguidas")).toBeInTheDocument();
  });

  it("renders losing streak with negative styling and text", () => {
    render(<WinStreak streak={-3} />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Derrotas seguidas")).toBeInTheDocument();
  });
});
