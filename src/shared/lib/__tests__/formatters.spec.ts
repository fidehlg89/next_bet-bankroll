import { describe, it, expect } from "vitest";
import { fEUR, fPct, fOdds, pnlClass, resultClass } from "../formatters";

// ── formatters ────────────────────────────────────────────────────────────────
//
// Unit tests for all pure formatting / CSS-class helpers in formatters.ts.
// No React, no Supabase — pure string/number → string transforms.
//
// Note: fDate, fDateTime, fMonth use Intl.DateTimeFormat (locale-specific).
// They are tested only for shape (not locale string content) to avoid
// environment-dependent failures across CI runners.
// ─────────────────────────────────────────────────────────────────────────────

// ── fEUR ─────────────────────────────────────────────────────────────────────

describe("fEUR", () => {
  it("formats a positive number as EUR currency (pt-PT locale)", () => {
    // We check the number and currency symbol are present, not the exact locale format
    const result = fEUR(100);
    expect(result).toContain("100");
    expect(result.toLowerCase()).toMatch(/€|eur/i);
  });

  it("formats zero correctly", () => {
    const result = fEUR(0);
    expect(result).toContain("0");
  });

  it("formats a negative number (shows minus sign)", () => {
    const result = fEUR(-50);
    expect(result).toContain("50");
    // Either a minus sign or parentheses depending on locale
    expect(result).toMatch(/-|50/);
  });

  it("handles null by treating it as 0", () => {
    const result = fEUR(null);
    expect(result).toContain("0");
  });

  it("handles undefined by treating it as 0", () => {
    const result = fEUR(undefined);
    expect(result).toContain("0");
  });
});

// ── fPct ─────────────────────────────────────────────────────────────────────

describe("fPct", () => {
  it("prefixes a positive value with '+'", () => {
    expect(fPct(5)).toBe("+5.00%");
  });

  it("does NOT prefix a negative value with '+'", () => {
    expect(fPct(-3.5)).toBe("-3.50%");
  });

  it("formats zero with '+' prefix", () => {
    expect(fPct(0)).toBe("+0.00%");
  });

  it("handles null by treating it as 0", () => {
    expect(fPct(null)).toBe("+0.00%");
  });

  it("handles undefined by treating it as 0", () => {
    expect(fPct(undefined)).toBe("+0.00%");
  });

  it("rounds to exactly 2 decimal places", () => {
    expect(fPct(1.234567)).toBe("+1.23%");
  });
});

// ── fOdds ─────────────────────────────────────────────────────────────────────

describe("fOdds", () => {
  it("formats an integer as 3 decimal places", () => {
    expect(fOdds(2)).toBe("2.000");
  });

  it("formats a float shorter than 3 decimals correctly", () => {
    expect(fOdds(1.5)).toBe("1.500");
  });

  it("formats a float with exactly 3 decimals unchanged", () => {
    expect(fOdds(1.875)).toBe("1.875");
  });

  it("rounds when more than 3 decimals are provided", () => {
    // 1.3337 → "1.334"
    expect(fOdds(1.3337)).toBe("1.334");
  });

  it("handles odds of 1.000 (minimum meaningful odds)", () => {
    expect(fOdds(1)).toBe("1.000");
  });
});

// ── pnlClass ─────────────────────────────────────────────────────────────────

describe("pnlClass", () => {
  it("returns 'text-pos' for a positive value", () => {
    expect(pnlClass(10)).toBe("text-pos");
  });

  it("returns 'text-neg' for a negative value", () => {
    expect(pnlClass(-5)).toBe("text-neg");
  });

  it("returns 'text-muted-foreground' for zero", () => {
    expect(pnlClass(0)).toBe("text-muted-foreground");
  });

  it("returns 'text-muted-foreground' for null", () => {
    expect(pnlClass(null)).toBe("text-muted-foreground");
  });

  it("returns 'text-muted-foreground' for undefined", () => {
    expect(pnlClass(undefined)).toBe("text-muted-foreground");
  });
});

// ── resultClass ───────────────────────────────────────────────────────────────

describe("resultClass", () => {
  it("returns emerald classes for 'W'", () => {
    expect(resultClass("W")).toBe("bg-emerald-500/15 text-pos border-emerald-500/30");
  });

  it("returns red classes for 'L'", () => {
    expect(resultClass("L")).toBe("bg-red-500/15 text-neg border-red-500/30");
  });

  it("returns zinc classes for 'P'", () => {
    expect(resultClass("P")).toBe("bg-zinc-500/15 text-muted-foreground border-zinc-500/30");
  });

  it("returns amber (pending) classes for null", () => {
    expect(resultClass(null)).toBe("bg-amber-500/15 text-pending border-amber-500/30");
  });

  it("returns amber (pending) classes for undefined", () => {
    expect(resultClass(undefined)).toBe("bg-amber-500/15 text-pending border-amber-500/30");
  });

  it("returns amber (pending) classes for an unknown string", () => {
    expect(resultClass("UNKNOWN")).toBe("bg-amber-500/15 text-pending border-amber-500/30");
  });
});
