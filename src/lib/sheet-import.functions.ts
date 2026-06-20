import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SPREADSHEET_ID = "1hfaM6rERPp3FW0g41aZRjGuLhorL8D7sMLIpWYL8nH8";
const SHEET_RANGE = "REGISTRO!A6:K1000";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

type SheetRow = (string | number | null)[];

function parseDate(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  // ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // dd/mm/yyyy or dd-mm-yyyy (slash or dash). Year optional → assume 2025.
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    let yyyy = m[3] ? m[3] : "2026";
    if (yyyy.length === 2) yyyy = `20${yyyy}`;
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

function toNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
}

function calcPnL(stake: number, odds: number, result: "W" | "L" | "P"): number {
  if (result === "W") return parseFloat((stake * (odds - 1)).toFixed(2));
  if (result === "L") return parseFloat((-stake).toFixed(2));
  return 0;
}

export const importFromGoogleSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const connKey = process.env.GOOGLE_SHEETS_API_KEY;
    if (!apiKey || !connKey) throw new Error("Google Sheets connector not configured");

    const url = `${GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Connection-Api-Key": connKey,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Sheet fetch failed ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as { values?: SheetRow[] };
    const rows = json.values ?? [];

    type BetInput = {
      user_id: string;
      bet_date: string;
      event: string | null;
      market: string;
      pick: string | null;
      bet_type: string;
      tipster: string;
      odds: number;
      stake: number;
      result: "W" | "L" | "P" | null;
      pnl: number | null;
    };
    const candidates: BetInput[] = [];
    for (const r of rows) {
      // cols: # | Fecha | Evento | Mercado | Pick | Tipo | Tipster | Cuota | Stake | W/L/P | P&L
      const bet_date = parseDate(r[1]);
      const odds = toNum(r[7]);
      const stake = toNum(r[8]);
      const tipster = (r[6] != null ? String(r[6]).trim() : "");
      const market = (r[3] != null ? String(r[3]).trim() : "");
      const bet_type = (r[5] != null ? String(r[5]).trim() : "Simple");
      if (!bet_date || odds == null || stake == null || !tipster || !market) continue;

      const rawResult = (r[9] != null ? String(r[9]).trim().toUpperCase() : "");
      const result: "W" | "L" | "P" | null =
        rawResult === "W" || rawResult === "L" || rawResult === "P" ? rawResult : null;
      let pnl: number | null = null;
      if (result) {
        const sheetPnl = toNum(r[10]);
        pnl = sheetPnl != null ? parseFloat(sheetPnl.toFixed(2)) : calcPnL(stake, odds, result);
      }
      candidates.push({
        user_id: context.userId,
        bet_date,
        event: r[2] ? String(r[2]).trim() : null,
        market,
        pick: r[4] ? String(r[4]).trim() : null,
        bet_type,
        tipster,
        odds,
        stake,
        result,
        pnl,
      });
    }

    // Dedupe vs existing bets for this user
    const { data: existing, error: selErr } = await context.supabase
      .from("bets")
      .select("bet_date,market,tipster,odds,stake,bet_type,pick,event");
    if (selErr) throw selErr;
    const keyOf = (b: {
      bet_date: string; market: string | null; tipster: string;
      odds: number; stake: number; bet_type: string;
      pick: string | null; event: string | null;
    }) =>
      `${b.bet_date}|${b.market ?? ""}|${b.tipster}|${b.odds}|${b.stake}|${b.bet_type}|${b.pick ?? ""}|${b.event ?? ""}`;
    const seen = new Set((existing ?? []).map(keyOf));
    const toInsert = candidates.filter((c) => !seen.has(keyOf(c)));

    if (toInsert.length === 0) {
      return { inserted: 0, skipped: candidates.length, total: candidates.length };
    }

    // Insert in chunks of 200
    const chunkSize = 200;
    let inserted = 0;
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize);
      const { error: insErr } = await context.supabase.from("bets").insert(chunk);
      if (insErr) throw insErr;
      inserted += chunk.length;
    }

    // Also seed tipsters
    const tipsterNames = Array.from(new Set(toInsert.map((b) => b.tipster)));
    if (tipsterNames.length) {
      const { data: existTips } = await context.supabase
        .from("tipsters")
        .select("name");
      const existSet = new Set((existTips ?? []).map((t) => t.name));
      const newTips = tipsterNames
        .filter((n) => !existSet.has(n))
        .map((name) => ({ user_id: context.userId, name, active: true }));
      if (newTips.length) {
        await context.supabase.from("tipsters").insert(newTips);
      }
    }

    return {
      inserted,
      skipped: candidates.length - inserted,
      total: candidates.length,
    };
  });