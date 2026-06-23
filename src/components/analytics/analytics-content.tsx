"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MetricsGrid } from "@/components/analytics/metrics-grid";
import { InstrumentBreakdown } from "@/components/analytics/instrument-breakdown";
import { BuySellBreakdown } from "@/components/analytics/buy-sell-breakdown";
import { EquityCurveChart } from "@/components/charts/equity-curve-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/card-skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function AnalyticsContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trades, setTrades] = useState<any[] | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { data, error: fetchError } = await supabase
        .from("trades")
        .select("id, trade_date, instrument, trade_type, profit_loss")
        .eq("user_id", user.id)
        .order("trade_date", { ascending: true });

      if (fetchError) throw fetchError;

      setTrades(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <ChartSkeleton />
        <MetricCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-loss-muted/40 bg-loss-muted/10 p-4 text-sm text-loss">
        <p>Failed to load data — try refreshing</p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="mt-2 gap-2"
        >
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    );
  }

  const metrics = computeMetrics(trades ?? []);
  const instrumentRows = computeInstrumentBreakdown(trades ?? []);
  const buySellRows = computeBuySellBreakdown(trades ?? []);

  return (
    <div className="space-y-6 animate-fade-in">
      <MetricsGrid metrics={metrics} />

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1fr_420px]">
        <EquityCurveChart trades={trades ?? []} />

        <Card className="card-sheen">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Buy vs sell</CardTitle>
          </CardHeader>
          <CardContent>
            <BuySellBreakdown rows={buySellRows} />
          </CardContent>
        </Card>
      </div>

      <Card className="card-sheen">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Instrument breakdown</CardTitle>
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
