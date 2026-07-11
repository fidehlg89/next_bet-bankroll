"use client";

import { useState } from "react";
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
import { format } from "date-fns";
import { fEUR } from "@/shared/lib/formatters";
import type { DailyTipsterPoint } from "../hooks/usePerformance";
import { Info } from "lucide-react";

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
  const [hiddenTipsters, setHiddenTipsters] = useState<Set<string>>(new Set());

  const handleLegendClick = (e: unknown) => {
    const payload = e as { dataKey?: string | number | symbol };
    if (!payload?.dataKey) return;
    
    const dataKey = String(payload.dataKey);
    setHiddenTipsters((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) {
        next.delete(dataKey);
      } else {
        next.add(dataKey);
      }
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-base font-semibold">P&amp;L acumulado por tipster</h3>
          <p className="mt-1 flex items-center text-[11px] text-muted-foreground/80">
            <Info className="mr-1 h-3 w-3" />
            Haz clic en un tipster en la leyenda para filtrarlo
          </p>
        </div>
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
                tickFormatter={(v: string) => format(new Date(v), "dd/MM")}
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
              <Legend
                wrapperStyle={{ fontSize: 11, cursor: "pointer" }}
                onClick={handleLegendClick}
              />
              {tipsters.map((t, i) => (
                <Line
                  key={t}
                  type="monotone"
                  dataKey={t}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  hide={hiddenTipsters.has(t)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
