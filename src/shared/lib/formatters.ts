export const fEUR = (v: number | null | undefined) => {
  const num = v ?? 0;
  // Round to 2 decimal places to avoid e.g. -0.004 showing as (0,00 €)
  const roundedNum = Math.round(num * 100) / 100;
  const formatted = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
    Math.abs(roundedNum),
  );
  return roundedNum < 0 ? `(${formatted})` : formatted;
};

export const fPct = (v: number | null | undefined) => {
  const n = v ?? 0;
  const roundedN = Math.round(n * 100) / 100;
  return `${roundedN >= 0 ? "+" : ""}${roundedN.toFixed(2)}%`;
};

export const fDate = (d: string) =>
  new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(d));

export const fDateTime = (d: string) =>
  new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(d));

export const fMonth = (d: string) =>
  new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(d));

export const fOdds = (v: number) => Number(v).toFixed(3);

export const pnlClass = (v: number | null | undefined) => {
  const n = v ?? 0;
  const roundedN = Math.round(n * 100) / 100;
  return roundedN > 0 ? "text-pos" : roundedN < 0 ? "text-neg" : "text-muted-foreground";
};

export const resultClass = (r?: string | null) =>
  ({
    W: "bg-emerald-500/15 text-pos border-emerald-500/30",
    L: "bg-red-500/15 text-neg border-red-500/30",
    P: "bg-zinc-500/15 text-muted-foreground border-zinc-500/30",
  })[r ?? ""] ?? "bg-amber-500/15 text-pending border-amber-500/30";
