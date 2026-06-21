export const fEUR = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v ?? 0);

export const fPct = (v: number | null | undefined) => {
  const n = v ?? 0;
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

export const fDate = (d: string) =>
  new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(d),
  );

export const fDateTime = (d: string) =>
  new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

export const fMonth = (d: string) =>
  new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(new Date(d));

export const fOdds = (v: number) => Number(v).toFixed(3);

export const pnlClass = (v: number | null | undefined) => {
  const n = v ?? 0;
  return n > 0 ? "text-pos" : n < 0 ? "text-neg" : "text-muted-foreground";
};

export const resultClass = (r?: string | null) =>
  ({
    W: "bg-emerald-500/15 text-pos border-emerald-500/30",
    L: "bg-red-500/15 text-neg border-red-500/30",
    P: "bg-zinc-500/15 text-muted-foreground border-zinc-500/30",
  })[r ?? ""] ?? "bg-amber-500/15 text-pending border-amber-500/30";
