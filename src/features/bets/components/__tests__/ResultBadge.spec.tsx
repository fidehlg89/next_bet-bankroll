import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultBadge } from "../ResultBadge";

// ── ResultBadge ──────────────────────────────────────────────────────────────
//
// Unit tests for the ResultBadge presentational component.
// This component has no external dependencies (no Supabase, no TanStack Query),
// making it the ideal entry point to validate the Vitest + Testing Library setup
// and establish the base pattern for future component specs.
//
// Mapping of result values → expected CSS classes (from formatters.ts):
//   W  → bg-emerald-500/15  text-pos     border-emerald-500/30
//   L  → bg-red-500/15      text-neg     border-red-500/30
//   P  → bg-zinc-500/15     text-muted-foreground  border-zinc-500/30
//   "" | null | undefined → bg-amber-500/15 text-pending border-amber-500/30
// ─────────────────────────────────────────────────────────────────────────────

describe("ResultBadge", () => {
  // ── Pending state ────────────────────────────────────────────────────────

  it("renders the pending bullet when result is undefined", () => {
    render(<ResultBadge />);
    expect(screen.getByText("•")).toBeInTheDocument();
  });

  it("renders the pending bullet when result is null", () => {
    render(<ResultBadge result={null} />);
    expect(screen.getByText("•")).toBeInTheDocument();
  });

  it("applies amber (pending) classes when result is null", () => {
    const { container } = render(<ResultBadge result={null} />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-amber-500/15");
    expect(span?.className).toContain("text-pending");
    expect(span?.className).toContain("border-amber-500/30");
  });

  // ── Win (W) ──────────────────────────────────────────────────────────────

  it("renders 'W' label when result is W", () => {
    render(<ResultBadge result="W" />);
    expect(screen.getByText("W")).toBeInTheDocument();
  });

  it("applies emerald (positive) classes when result is W", () => {
    const { container } = render(<ResultBadge result="W" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-emerald-500/15");
    expect(span?.className).toContain("text-pos");
    expect(span?.className).toContain("border-emerald-500/30");
  });

  // ── Loss (L) ─────────────────────────────────────────────────────────────

  it("renders 'L' label when result is L", () => {
    render(<ResultBadge result="L" />);
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("applies red (negative) classes when result is L", () => {
    const { container } = render(<ResultBadge result="L" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-red-500/15");
    expect(span?.className).toContain("text-neg");
    expect(span?.className).toContain("border-red-500/30");
  });

  // ── Push (P) ─────────────────────────────────────────────────────────────

  it("renders 'P' label when result is P", () => {
    render(<ResultBadge result="P" />);
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("applies zinc (neutral) classes when result is P", () => {
    const { container } = render(<ResultBadge result="P" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-zinc-500/15");
    expect(span?.className).toContain("text-muted-foreground");
    expect(span?.className).toContain("border-zinc-500/30");
  });

  // ── Shared structure ─────────────────────────────────────────────────────

  it("always renders a <span> element", () => {
    const { container } = render(<ResultBadge result="W" />);
    expect(container.querySelector("span")).not.toBeNull();
  });

  it("always has the base layout classes regardless of result", () => {
    const results = [undefined, null, "W", "L", "P"] as const;

    results.forEach((result) => {
      const { container } = render(<ResultBadge result={result} />);
      const span = container.querySelector("span");
      expect(span?.className).toContain("inline-flex");
      expect(span?.className).toContain("rounded-md");
      expect(span?.className).toContain("border");
    });
  });
});
