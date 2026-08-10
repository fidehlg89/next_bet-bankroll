import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validate22BetHtml,
  parse22BetHtml,
  import22BetHistory,
} from "../html-22bet-import.functions";
import type { SupabaseClient } from "@supabase/supabase-js";

// Helper to generate a valid HTML snippet
const pad = (s: string) => s + "<!--" + "x".repeat(200) + "-->";

const generateHtml = (
  ticket = "12345",
  resultHtml = "no pagado",
  stake = "10.00",
  type = "Simple",
  odds = "2.50",
  date = "15.08.2023 | 14:30",
) => `
<html><body>
<div class="cupHisNew">
  Boleto de apuestas №${ticket}
  <time>${date}</time>
  Tipo de apuesta: ${type}
  <table>
    <tr>
      <td class="ha">
        <b>Fútbol.<br>Real Madrid vs Barcelona</b>
      </td>
      <td class="ce" rowspan="2">${type === "Simple" ? "Real Madrid a ganar" : "Pick"}</td>
      <td class="ce" rowspan="2">${odds}</td>
    </tr>
    <tr>
      <td colspan="2"><div class="hisCof" style="">${odds}</div></td>
      <td class="ce">${stake} EUR</td>
      <td class="ce" style="color:red"><b>${resultHtml}</b></td>
    </tr>
  </table>
</div>
</body></html>
`;

describe("html-22bet-import.functions", () => {
  describe("validate22BetHtml", () => {
    it("should pass for valid HTML", () => {
      const html = generateHtml();
      // To pass length check, make it at least 200 chars
      expect(() => validate22BetHtml(pad(html))).not.toThrow();
    });

    it("should throw if HTML is empty", () => {
      expect(() => validate22BetHtml("")).toThrow(/El campo está vacío/);
    });

    it("should throw if HTML is too short", () => {
      expect(() => validate22BetHtml("<html></html>")).toThrow(/demasiado corto/);
    });

    it("should throw if not HTML", () => {
      expect(() => validate22BetHtml("This is just a long text ".repeat(10))).toThrow(
        /No parece HTML/,
      );
    });

    it("should throw if missing ticket block", () => {
      const html = `<html><body><div class="wrong-class">Boleto de apuestas №12345 <time>15.08.2023</time> 10.00 EUR</div></body></html>`;
      expect(() => validate22BetHtml(pad(html))).toThrow(/no se encontraron bloques de boletos/);
    });
  });

  describe("parse22BetHtml", () => {
    it("should parse a pending bet correctly", () => {
      const html = generateHtml("12345", "no pagado");
      const result = parse22BetHtml(html.padEnd(200, " "));

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ticket: "12345",
        bet_date: "2023-08-15T14:30:00.000Z",
        market: "Football",
        event: "Real Madrid vs Barcelona",
        pick: "Real Madrid a ganar",
        bet_type: "Simple",
        odds: 2.5,
        stake: 10,
        result: null,
        pnl: null,
      });
    });

    it("should parse a winning bet correctly", () => {
      const html = generateHtml("12346", "25.00 EUR"); // Payout is 25, stake 10 -> net 15
      const result = parse22BetHtml(html.padEnd(200, " "));

      expect(result).toHaveLength(1);
      expect(result[0].result).toBe("W");
      expect(result[0].pnl).toBe(15.0);
    });

    it("should parse a losing bet correctly", () => {
      const html = generateHtml("12347", "derrota");
      const result = parse22BetHtml(html.padEnd(200, " "));

      expect(result).toHaveLength(1);
      expect(result[0].result).toBe("L");
      expect(result[0].pnl).toBe(-10.0);
    });

    it("should parse a pushed (void) bet correctly", () => {
      const html = generateHtml("12348", "10.00 EUR"); // Payout = stake
      const result = parse22BetHtml(html.padEnd(200, " "));

      expect(result).toHaveLength(1);
      expect(result[0].result).toBe("P");
      expect(result[0].pnl).toBe(0);
    });
  });

  describe("import22BetHistory", () => {
    let mockSupabase: unknown;
    let mockSelectFn: ReturnType<typeof vi.fn>;
    let mockInsertFn: ReturnType<typeof vi.fn>;
    let mockUpdateFn: ReturnType<typeof vi.fn>;
    let mockEqFn: ReturnType<typeof vi.fn>;
    let mockInFn: ReturnType<typeof vi.fn>;
    let mockMaybeSingleFn: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Setup chainable mock functions for Supabase query builder
      mockMaybeSingleFn = vi.fn().mockResolvedValue({ data: null, error: null });
      mockInFn = vi.fn().mockResolvedValue({ data: [], error: null });
      mockEqFn = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingleFn });
      mockUpdateFn = vi.fn().mockReturnValue({ eq: mockEqFn });
      mockInsertFn = vi.fn().mockResolvedValue({ error: null });

      mockSelectFn = vi.fn().mockReturnValue({
        in: mockInFn,
        eq: mockEqFn,
      });

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: mockSelectFn,
          insert: mockInsertFn,
          update: mockUpdateFn,
        }),
      } as unknown as SupabaseClient;

      // Ensure mockEqFn correctly mimics resolving directly after update
      mockEqFn.mockImplementation((key, val) => {
        // If called from update, it should return a promise with error
        return Promise.resolve({ error: null });
      });
      // But if called from select.eq, it needs to chain maybeSingle
      mockSelectFn.mockImplementation(() => {
        return {
          in: mockInFn,
          eq: (key: string, val: string) => ({
            maybeSingle: mockMaybeSingleFn,
          }),
        };
      });
    });

    it("should insert new bets and prevent duplicates", async () => {
      // Arrange: Two bets in HTML (one pending, one win)
      const html = generateHtml("100", "no pagado") + generateHtml("200", "25.00 EUR");

      // Simulate DB having bet 100 already (as pending), but 200 is new.
      mockInFn.mockResolvedValueOnce({
        data: [{ id: "uuid-1", external_id: "22bet:100", result: null }],
        error: null,
      });

      // Act
      const result = await import22BetHistory(pad(html), "user123", mockSupabase);

      // Assert
      expect(result.parsed).toBe(2);
      expect(result.inserted).toBe(1); // Only bet 200 should be inserted
      expect(result.skipped).toBe(1); // Bet 100 was pending and HTML is still pending -> skipped
      expect(result.updated).toBe(0);

      // Verify tipster defaults to "Sin asignar"
      expect(mockInsertFn).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ external_id: "22bet:200", tipster: "Sin asignar" }),
        ]),
      );
    });

    it("should update existing pending bets if they now have a result", async () => {
      // Arrange: Bet 100 is now a WIN in HTML
      const html = generateHtml("100", "25.00 EUR");

      // DB has bet 100 as pending
      mockInFn.mockResolvedValueOnce({
        data: [{ id: "uuid-1", external_id: "22bet:100", result: null }],
        error: null,
      });

      // Act
      const result = await import22BetHistory(pad(html), "user123", mockSupabase);

      // Assert
      expect(result.parsed).toBe(1);
      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(1);
      expect(result.skipped).toBe(0);

      expect(mockUpdateFn).toHaveBeenCalledWith({ result: "W", pnl: 15 });
    });

    it("should create 'Sin asignar' tipster if it doesn't exist during insert", async () => {
      const html = generateHtml("300", "derrota");
      mockInFn.mockResolvedValueOnce({ data: [], error: null }); // No existing bets
      mockMaybeSingleFn.mockResolvedValueOnce({ data: null, error: null }); // Tipster not found

      await import22BetHistory(pad(html), "user123", mockSupabase);

      expect(mockInsertFn).toHaveBeenCalledWith({
        user_id: "user123",
        name: "Sin asignar",
        active: true,
      });
    });
  });
});
