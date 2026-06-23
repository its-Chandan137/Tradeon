"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FinancialValue } from "@/components/financial-value";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton, MetricCardSkeleton } from "@/components/ui/card-skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function OverviewContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<any>(null);
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

      const [accountResult, tradesResult] = await Promise.all([
        supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("trades")
          .select("profit_loss")
          .eq("user_id", user.id),
      ]);

      if (accountResult.error) throw accountResult.error;
      if (tradesResult.error) throw tradesResult.error;

      setAccount(accountResult.data);
      setTrades(tradesResult.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <CardSkeleton />
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

  const netPnl = trades?.reduce((sum, trade) => sum + Number(trade.profit_loss ?? 0), 0) ?? 0;
  const currentBalance = Number(account?.current_balance ?? 0);
  const profitTarget = Number(account?.profit_target ?? 0);
  const progress = profitTarget > 0 ? Math.min((netPnl / profitTarget) * 100, 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="card-sheen">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Current balance</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{account?.account_name ?? "No active account"}</CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialValue
              value={currentBalance}
              className="text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl"
            />
          </CardContent>
        </Card>

        <Card className="card-sheen">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Net P/L</CardTitle>
            <CardDescription className="text-xs sm:text-sm">All trades in your journal</CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialValue
              value={netPnl}
              sign="auto"
              className={cnProfit(netPnl)}
            />
          </CardContent>
        </Card>

        <Card className="card-sheen">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Account phase</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest account status</CardDescription>
          </CardHeader>
          <CardContent>
            {account ? <Badge variant="secondary" className="text-xs">{account.phase}</Badge> : <Badge variant="secondary" className="text-xs">Not set</Badge>}
          </CardContent>
        </Card>
      </div>

      <Card className="card-sheen">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Profit target progress</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {account ? `Progress toward ${account.account_name}'s target.` : "Create an account to start tracking progress."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-2 text-xs sm:text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">Net P/L</span>
            <FinancialValue value={netPnl} sign="auto" className={cnProfit(netPnl)} />
          </div>
          <div className="flex flex-col gap-2 text-xs sm:text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">Target</span>
            <FinancialValue value={profitTarget} className="text-gold-bright" />
          </div>
          <Progress value={progress} className="h-2 sm:h-3" />
          <p className="text-right text-[10px] sm:text-xs text-muted-foreground tabular-finance">
            {progress.toFixed(1)}% complete
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function cnProfit(value: number) {
  return value >= 0 ? "text-profit" : "text-loss";
}
