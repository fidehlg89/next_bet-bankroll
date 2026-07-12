import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultDistributionChartProps {
  data: { name: string; value: number; fill: string }[];
}

export function ResultDistributionChart({ data }: ResultDistributionChartProps) {
  // If there's no data or all values are 0, we can show a placeholder or empty state
  const hasData = data && data.some((d) => d.value > 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Distribución de Resultados</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="h-[300px] w-full">
          {!hasData ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No hay suficientes datos para mostrar la distribución.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} apuestas`,
                    name === "W" ? "Ganadas" : name === "L" ? "Perdidas" : "Nulas",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  formatter={(value) => {
                    const count = data.find((d) => d.name === value)?.value ?? 0;
                    if (value === "W") return `W (Ganadas) - ${count}`;
                    if (value === "L") return `L (Perdidas) - ${count}`;
                    if (value === "P") return `P (Nulas) - ${count}`;
                    return `${value} - ${count}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
