import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fEUR } from "@/shared/lib/formatters";

interface Point {
  date: string;
  bankroll: number;
}

export function BankrollChart({ data }: { data: Point[] }) {
  const bankrolls = data.map((d) => d.bankroll);
  const max = bankrolls.length > 0 ? Math.max(...bankrolls) : 0;
  const min = bankrolls.length > 0 ? Math.min(...bankrolls) : 0;
  const avg = bankrolls.length > 0 ? bankrolls.reduce((a, b) => a + b, 0) / bankrolls.length : 0;

  // Escala de 150 en 150
  const startTick = Math.floor(min / 150) * 150;
  const endTick = Math.ceil(max / 150) * 150;
  const ticks = [];
  for (let i = startTick; i <= endTick; i += 150) {
    ticks.push(i);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-base font-semibold">Evolución del Bankroll</h3>
        <span className="text-xs text-muted-foreground">Acumulado por fecha</span>
      </div>
      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Sin datos todavía
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-green)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent-green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" hide={true} scale="point" padding={{ left: 0, right: 0 }} />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fEUR(v)}
                ticks={ticks}
                domain={[startTick, endTick]}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [fEUR(v), "Bankroll"]}
              />
              <ReferenceLine
                y={max}
                stroke="var(--color-muted-foreground)"
                strokeDasharray="3 3"
                opacity={0.5}
                label={{
                  value: fEUR(max),
                  position: "insideBottomRight",
                  fill: "var(--color-muted-foreground)",
                  fontSize: 11,
                  dy: -4,
                }}
              />
              <ReferenceLine
                y={avg}
                stroke="var(--color-muted-foreground)"
                strokeDasharray="3 3"
                opacity={0.3}
                label={{
                  value: fEUR(avg),
                  position: "insideBottomRight",
                  fill: "var(--color-muted-foreground)",
                  fontSize: 11,
                  dy: -4,
                }}
              />
              <ReferenceLine
                y={min}
                stroke="var(--color-muted-foreground)"
                strokeDasharray="3 3"
                opacity={0.5}
                label={{
                  value: fEUR(min),
                  position: "insideTopRight",
                  fill: "var(--color-muted-foreground)",
                  fontSize: 11,
                  dy: 4,
                }}
              />
              <Area
                type="monotone"
                dataKey="bankroll"
                stroke="var(--accent-green)"
                strokeWidth={2}
                fill="url(#bk)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
