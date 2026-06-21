import { FinancialValue } from "@/components/financial-value";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsGridProps {
  metrics: {
    totalTrades: number;
    winRate: number;
    lossRate: number;
    totalProfit: number;
    averageTrade: number;
    bestTrade: number | null;
    worstTrade: number | null;
  };
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Total trades" value={metrics.totalTrades} />
      <MetricCard title="Win rate" value={`${metrics.winRate.toFixed(1)}%`} />
      <MetricCard title="Loss rate" value={`${metrics.lossRate.toFixed(1)}%`} />
      <MetricCard
        title="Total profit"
        value={<FinancialValue value={metrics.totalProfit} sign="auto" className={cnProfit(metrics.totalProfit)} />}
      />
      <MetricCard
        title="Average trade"
        value={<FinancialValue value={metrics.averageTrade} sign="auto" className={cnProfit(metrics.averageTrade)} />}
      />
      <MetricCard
        title="Best trade"
        value={
          metrics.bestTrade === null ? (
            "—"
          ) : (
            <FinancialValue value={metrics.bestTrade} sign="auto" className="text-profit" />
          )
        }
      />
      <MetricCard
        title="Worst trade"
        value={
          metrics.worstTrade === null ? (
            "—"
          ) : (
            <FinancialValue value={metrics.worstTrade} sign="auto" className="text-loss" />
          )
        }
      />
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="tabular-finance text-2xl font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function cnProfit(value: number) {
  return value >= 0 ? "text-profit" : "text-loss";
}
