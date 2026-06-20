import { SupabaseClient } from "@supabase/supabase-js";

export const import22BetHistory = async (html: string, userId: string, supabase: SupabaseClient) => {
  if (!html || typeof html !== "string") {
    throw new Error("HTML inválido");
  }
  if (html.length > 20_000_000) {
    throw new Error("HTML demasiado grande (máx. 20 MB)");
  }
  
  validate22BetHtml(html);
  const bets = parse22BetHtml(html);
  if (bets.length === 0) {
    throw new Error(
      "El HTML parece de 22Bet pero no se pudo extraer ningún boleto. El formato puede haber cambiado o el historial está vacío.",
    );
  }

  const externalIds = bets.map((b) => `22bet:${b.ticket}`);

  const { data: existing, error: selErr } = await supabase
    .from("bets")
    .select("id, external_id, result")
    .in("external_id", externalIds);
  if (selErr) throw selErr;
  const existingMap = new Map<string, { id: string; result: string | null }>();
  for (const row of existing ?? []) {
    if (row.external_id) existingMap.set(row.external_id, { id: row.id, result: row.result });
  }

  type InsertRow = {
    user_id: string;
    bet_date: string;
    event: string | null;
    market: string;
    pick: string;
    bet_type: string;
    tipster: string;
    odds: number;
    stake: number;
    result: "W" | "L" | "P" | null;
    pnl: number | null;
    external_id: string;
  };
  const toInsert: InsertRow[] = [];
  const toUpdate: { id: string; result: string; pnl: number | null }[] = [];
  let skipped = 0;

  for (const b of bets) {
    const ext = `22bet:${b.ticket}`;
    const ex = existingMap.get(ext);
    if (ex) {
      // Only update if currently pending and now resolved.
      if (!ex.result && b.result) {
        toUpdate.push({ id: ex.id, result: b.result, pnl: b.pnl });
      } else {
        skipped++;
      }
      continue;
    }
    toInsert.push({
      user_id: userId,
      bet_date: b.bet_date,
      event: b.event,
      market: b.market,
      pick: b.pick,
      bet_type: b.bet_type,
      tipster: "Sin asignar",
      odds: b.odds,
      stake: b.stake,
      result: b.result,
      pnl: b.pnl,
      external_id: ext,
    });
  }

  let inserted = 0;
  const CHUNK = 200;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const chunk = toInsert.slice(i, i + CHUNK);
    const { error } = await supabase.from("bets").insert(chunk);
    if (error) throw error;
    inserted += chunk.length;
  }

  let updated = 0;
  for (const u of toUpdate) {
    const { error } = await supabase
      .from("bets")
      .update({ result: u.result, pnl: u.pnl })
      .eq("id", u.id);
    if (error) throw error;
    updated++;
  }

  // Make sure the "Sin asignar" tipster exists in the catalog
  if (inserted > 0) {
    const { data: tip } = await supabase
      .from("tipsters")
      .select("id")
      .eq("name", "Sin asignar")
      .maybeSingle();
    if (!tip) {
      await supabase
        .from("tipsters")
        .insert({ user_id: userId, name: "Sin asignar", active: true });
    }
  }

  return { parsed: bets.length, inserted, updated, skipped };
};