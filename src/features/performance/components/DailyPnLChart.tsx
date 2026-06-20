import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fEUR } from "@/shared/lib/formatters";
import type { DailyTipsterPoint } from "../hooks/usePerformance";

const COLORS = [
  "var(--accent-green)",
  "var(--accent-gold)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--accent-red)",
  "#9ca3af",
];

export function DailyPnLChart({
  points,
  tipsters,
}: {
  points: DailyTipsterPoint[];
  tipsters: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-base font-semibold">P&amp;L acumulado por tipster</h3>
        <span className="text-xs text-muted-foreground">€ acumulados</span>
      </div>
      <div className="h-[320px]">
        {points.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Sin datos
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickFormatter={(v: number) => `${v}€`}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => fEUR(v)}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {tipsters.map((t, i) => (
                <Line
                  key={t}
                  type="monotone"
                  dataKey={t}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
