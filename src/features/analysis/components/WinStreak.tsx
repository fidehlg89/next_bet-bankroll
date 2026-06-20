import { Flame, Snowflake } from "lucide-react";

export function WinStreak({ streak }: { streak: number }) {
  const isWin = streak > 0;
  const abs = Math.abs(streak);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Racha actual
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span
          className={`grid h-12 w-12 place-items-center rounded-lg ${isWin ? "bg-emerald-500/15 text-pos" : abs ? "bg-red-500/15 text-neg" : "bg-secondary text-muted-foreground"}`}
        >
          {isWin ? <Flame className="h-6 w-6" /> : <Snowflake className="h-6 w-6" />}
        </span>
        <div>
          <div
            className={`font-display text-3xl font-semibold tabular-nums ${isWin ? "text-pos" : abs ? "text-neg" : ""}`}
          >
            {abs || "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {abs === 0 ? "Sin liquidados" : isWin ? "Victorias seguidas" : "Derrotas seguidas"}
          </div>
        </div>
      </div>
    </div>
  );
}
