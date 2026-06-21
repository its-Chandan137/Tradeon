import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MetricsGrid } from "@/components/analytics/metrics-grid";
import { InstrumentBreakdown } from "@/components/analytics/instrument-breakdown";
import { BuySellBreakdown } from "@/components/analytics/buy-sell-breakdown";
import { EquityCurveChart } from "@/components/charts/equity-curve-chart";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: trades, error } = await supabase
    .from("trades")
    .select("id, trade_date, instrument, trade_type, profit_loss")
    .eq("user_id", user.id)
    .order("trade_date", { ascending: true });

  if (error) {
    throw error;
  }

  const metrics = computeMetrics(trades ?? []);
  const instrumentRows = computeInstrumentBreakdown(trades ?? []);
  const buySellRows = computeBuySellBreakdown(trades ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Performance analytics"
        description="Review win rate, P/L distribution, equity progression, and breakdowns by instrument and direction."
      />

      <MetricsGrid metrics={metrics} />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <EquityCurveChart trades={trades ?? []} />

        <Card>
          <CardHeader>
            <CardTitle>Buy vs sell</CardTitle>
          </CardHeader>
          <CardContent>
            <BuySellBreakdown rows={buySellRows} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instrument breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <InstrumentBreakdown rows={instrumentRows} />
        </CardContent>
      </Card>
    </div>
  );
}

function computeMetrics(
  trades: Array<{
    id: string;
    trade_date: string;
    instrument: string;
    trade_type: "BUY" | "SELL";
    profit_loss: number;
  }>,
) {
  const totalTrades = trades.length;
  const wins = trades.filter((trade) => Number(trade.profit_loss) > 0).length;
  const losses = trades.filter((trade) => Number(trade.profit_loss) < 0).length;
  const totalProfit = trades.reduce((sum, trade) => sum + Number(trade.profit_loss ?? 0), 0);
  const averageTrade = totalTrades === 0 ? 0 : totalProfit / totalTrades;
  const bestTrade = trades.length === 0 ? null : Math.max(...trades.map((trade) => Number(trade.profit_loss ?? 0)));
  const worstTrade = trades.length === 0 ? null : Math.min(...trades.map((trade) => Number(trade.profit_loss ?? 0)));

  return {
    totalTrades,
    winRate: totalTrades === 0 ? 0 : (wins / totalTrades) * 100,
    lossRate: totalTrades === 0 ? 0 : (losses / totalTrades) * 100,
    totalProfit,
    averageTrade,
    bestTrade,
    worstTrade,
  };
}

function computeInstrumentBreakdown(
  trades: Array<{
    instrument: string;
    trade_type: "BUY" | "SELL";
    profit_loss: number;
  }>,
) {
  const map = new Map<
    string,
    {
      instrument: string;
      totalTrades: number;
      wins: number;
      losses: number;
      totalProfit: number;
    }
  >();

  for (const trade of trades) {
    const existing = map.get(trade.instrument) ?? {
      instrument: trade.instrument,
      totalTrades: 0,
      wins: 0,
      losses: 0,
      totalProfit: 0,
    };

    const pnl = Number(trade.profit_loss ?? 0);
    existing.totalTrades += 1;
    existing.totalProfit += pnl;

    if (pnl > 0) {
      existing.wins += 1;
    } else if (pnl < 0) {
      existing.losses += 1;
    }

    map.set(trade.instrument, existing);
  }

  return [...map.values()].sort((a, b) => b.totalProfit - a.totalProfit);
}

function computeBuySellBreakdown(
  trades: Array<{
    trade_type: "BUY" | "SELL";
    profit_loss: number;
  }>,
) {
  const rows = [
    { tradeType: "BUY" as const, totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 },
    { tradeType: "SELL" as const, totalTrades: 0, wins: 0, losses: 0, totalProfit: 0 },
  ];

  for (const trade of trades) {
    const row = rows.find((item) => item.tradeType === trade.trade_type);
    const pnl = Number(trade.profit_loss ?? 0);

    if (!row) {
      continue;
    }

    row.totalTrades += 1;
    row.totalProfit += pnl;

    if (pnl > 0) {
      row.wins += 1;
    } else if (pnl < 0) {
      row.losses += 1;
    }
  }

  return rows;
}
