import { SupabaseClient } from "@supabase/supabase-js";

type ParsedBet = {
  ticket: string;
  bet_date: string; // YYYY-MM-DD
  market: string;
  event: string | null;
  pick: string;
  bet_type: "Simple" | "Combinada";
  odds: number;
  stake: number;
  result: "W" | "L" | "P" | null;
  pnl: number | null;
};

const SPORT_MAP: Record<string, string> = {
  fútbol: "Football",
  futbol: "Football",
  tenis: "Tennis",
  baloncesto: "Basketball",
  basket: "Basketball",
  básquet: "Basketball",
  basquet: "Basketball",
  hockey: "Hockey",
  voleibol: "Volleyball",
  béisbol: "Baseball",
  beisbol: "Baseball",
};

function mapSport(raw: string): string {
  const head = raw.split(".")[0].trim().toLowerCase();
  return SPORT_MAP[head] ?? raw.split(".")[0].trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function parseEuro(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.match(/-?\d+(?:[.,]\d+)?/);
  if (!m) return null;
  const n = parseFloat(m[0].replace(",", "."));
  return isNaN(n) ? null : n;
}

function ddmmyyyyToIso(s: string): string | null {
  const m = s.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s*\|\s*(\d{2}:\d{2}))?/);
  if (!m) return null;
  if (m[4]) {
    return `${m[3]}-${m[2]}-${m[1]}T${m[4]}:00`;
  }
  return `${m[3]}-${m[2]}-${m[1]}T00:00:00`;
}

export function validate22BetHtml(html: string): void {
  const trimmed = html.trim();
  if (!trimmed) {
    throw new Error("El campo está vacío. Pega el HTML del historial de 22Bet.");
  }
  if (trimmed.length < 200) {
    throw new Error(
      "El contenido es demasiado corto para ser un historial de 22Bet. Asegúrate de copiar la página completa (Ctrl+U → Ctrl+A → Ctrl+C).",
    );
  }

  const looksLikeHtml = /<\/?[a-z][\s\S]*?>/i.test(trimmed);
  if (!looksLikeHtml) {
    throw new Error(
      "No parece HTML. Copia el código fuente de la página de 22Bet (Ctrl+U), no el texto visible.",
    );
  }

  const hasBlocks = /class="cupHisNew/.test(trimmed);
  const hasTicket = /Boleto de apuestas\s*№\s*\d+/.test(trimmed);

  if (!hasBlocks && !hasTicket) {
    throw new Error(
      "No se reconoce el formato de 22Bet. Faltan los bloques de boletos (cupHisNew). Verifica que estés exportando el historial de apuestas de 22Bet.",
    );
  }
  if (!hasBlocks) {
    throw new Error("Formato de 22Bet inválido: no se encontraron bloques de boletos (cupHisNew).");
  }
  if (!hasTicket) {
    throw new Error(
      'Formato de 22Bet inválido: no se encontró ningún número de boleto ("Boleto de apuestas №").',
    );
  }
  if (!/<time>\s*\d{2}\.\d{2}\.\d{4}/.test(trimmed)) {
    throw new Error(
      "Formato de 22Bet inválido: faltan las fechas de los boletos (<time>dd.mm.aaaa).",
    );
  }
  if (!/\d+[.,]\d{1,2}\s*EUR/.test(trimmed)) {
    throw new Error(
      "Formato de 22Bet inválido: no se encontraron importes en EUR. ¿La moneda de tu cuenta es distinta?",
    );
  }
}

export function parse22BetHtml(html: string): ParsedBet[] {
  const out: ParsedBet[] = [];
  const blocks = html.split(/<div class="cupHisNew[^"]*">/g).slice(1);

  for (const rawBlock of blocks) {
    const endIdx = rawBlock.indexOf("</table>");
    const block = endIdx >= 0 ? rawBlock.slice(0, endIdx + 8) : rawBlock;

    const isExpress = /class="cupHisNew express"/.test(html) ? true : false;
    void isExpress;

    const ticketMatch = block.match(/Boleto de apuestas №(\d+)/);
    if (!ticketMatch) continue;
    const ticket = ticketMatch[1];

    const timeMatch = block.match(/<time>([^<]+)<\/time>/);
    if (!timeMatch) continue;
    const bet_date = ddmmyyyyToIso(timeMatch[1]);
    if (!bet_date) continue;

    const typeMatch = block.match(/Tipo de apuesta:\s*([^<\n]+)/);
    const bet_type: "Simple" | "Combinada" =
      typeMatch && /combinada/i.test(typeMatch[1]) ? "Combinada" : "Simple";

    const legRegex =
      /<td class="ha">[\s\S]*?<b[^>]*>([\s\S]*?)<\/b>[\s\S]*?<\/td>\s*<td class="ce" rowspan="2">\s*([\s\S]*?)\s*<\/td>\s*<td class="ce" rowspan="2">\s*([0-9.,]+)\s*<\/td>/g;

    const legs: { sportLabel: string; eventName: string; pick: string; odds: number }[] = [];
    let lm: RegExpExecArray | null;
    while ((lm = legRegex.exec(block)) !== null) {
      const raw = stripTags(lm[1]);
      const rawHtml = lm[1];
      const parts = rawHtml.split(/<br\s*\/?>(?![^<]*<\/b>)/i);
      const sportLabel = stripTags(parts[0] ?? raw);
      const eventName = stripTags(parts[1] ?? "");
      legs.push({
        sportLabel,
        eventName,
        pick: stripTags(lm[2]),
        odds: parseFloat(lm[3].replace(",", ".")) || 0,
      });
    }
    if (legs.length === 0) continue;

    const market = mapSport(legs[0].sportLabel);
    const event =
      bet_type === "Combinada"
        ? legs
            .map((l) => l.eventName)
            .filter(Boolean)
            .join(" / ")
        : legs[0].eventName || null;
    const pick = legs.map((l) => l.pick).join(" / ");

    const oddsMatch = block.match(/<div class="hisCof"[^>]*>\s*([0-9.,]+)\s*<\/div>/);
    const odds = oddsMatch ? parseFloat(oddsMatch[1].replace(",", ".")) : 0;
    if (!odds) continue;

    const summaryIdx = block.lastIndexOf('<td colspan="2"></td>');
    const summary = summaryIdx >= 0 ? block.slice(summaryIdx) : block;
    const stakeMatch = summary.match(/<td class="ce">\s*([0-9.,]+)\s*EUR\s*<\/td>/);
    if (!stakeMatch) continue;
    const stake = parseFloat(stakeMatch[1].replace(",", "."));
    if (!stake) continue;

    const payoutMatch = summary.match(/<td class="ce" style="[^"]*">\s*<b>\s*([^<]+?)\s*<\/b>/);
    const payoutRaw = payoutMatch ? payoutMatch[1].trim() : "";

    let result: "W" | "L" | "P" | null = null;
    let pnl: number | null = null;

    if (/^no pagado$/i.test(payoutRaw) || payoutRaw === "" || /^EUR$/i.test(payoutRaw)) {
      result = null;
      pnl = null;
    } else if (/^derrota$/i.test(payoutRaw)) {
      result = "L";
      pnl = -stake;
    } else {
      const payout = parseEuro(payoutRaw);
      if (payout == null) {
        result = null;
        pnl = null;
      } else {
        const net = payout - stake;
        if (Math.abs(net) < 0.005) {
          result = "P";
          pnl = 0;
        } else if (net > 0) {
          result = "W";
          pnl = parseFloat(net.toFixed(2));
        } else {
          result = "L";
          pnl = parseFloat(net.toFixed(2));
        }
      }
    }

    out.push({
      ticket,
      bet_date,
      market,
      event,
      pick: pick || "—",
      bet_type,
      odds,
      stake: parseFloat(stake.toFixed(2)),
      result,
      pnl,
    });
  }

  return out;
}
export const import22BetHistory = async (
  html: string,
  userId: string,
  supabase: SupabaseClient,
) => {
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
