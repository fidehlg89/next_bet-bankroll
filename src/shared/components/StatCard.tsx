import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string | React.ReactNode;
  tone?: "neutral" | "pos" | "neg" | "pending";
  action?: React.ReactNode;
}

export function StatCard({ label, value, hint, tone = "neutral", action }: Props) {
  const toneClass =
    tone === "pos"
      ? "text-pos"
      : tone === "neg"
        ? "text-neg"
        : tone === "pending"
          ? "text-pending"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-5 relative">
      <div className="flex justify-between items-start">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={cn("mt-2 font-display text-3xl font-semibold tabular-nums", toneClass)}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
