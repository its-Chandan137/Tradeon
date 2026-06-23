"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FinancialValue } from "@/components/financial-value";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TradeForEquity {
  id: string;
  trade_date: string;
  profit_loss: number;
}

export function EquityCurveChart({ trades }: { trades: TradeForEquity[] }) {
  const data = useMemo(() => {
    return trades
      .slice()
      .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())
      .reduce((rows: Array<{ index: number; date: string; equity: number }>, trade, index) => {
        const previousEquity = rows[index - 1]?.equity ?? 0;
        const equity = previousEquity + Number(trade.profit_loss ?? 0);

        rows.push({
          index: index + 1,
          date: new Date(trade.trade_date).toLocaleDateString(),
          equity,
        });

        return rows;
      }, []);
  }, [trades]);

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Equity curve</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-md border border-border bg-surface-raised text-sm text-muted-foreground">
            Log trades to build your equity curve.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 12, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis
                dataKey="index"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) {
                    return null;
                  }

                  const point = payload[0].payload as { date: string; equity: number };

                  return (
                    <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm shadow-terminal">
                      <p className="text-muted-foreground">{point.date}</p>
                      <FinancialValue value={point.equity} sign="auto" className="tabular-finance font-mono text-gold-bright" />
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: "#F0B429", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
