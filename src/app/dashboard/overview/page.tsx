import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FinancialValue } from "@/components/financial-value";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function OverviewPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: trades } = await supabase
    .from("trades")
    .select("profit_loss")
    .eq("user_id", user.id);

  const netPnl = trades?.reduce((sum, trade) => sum + Number(trade.profit_loss ?? 0), 0) ?? 0;
  const currentBalance = Number(account?.current_balance ?? 0);
  const profitTarget = Number(account?.profit_target ?? 0);
  const progress = profitTarget > 0 ? Math.min((netPnl / profitTarget) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Trading dashboard"
        description="A concise view of your active account, progress, and total journal performance."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current balance</CardTitle>
            <CardDescription>{account?.account_name ?? "No active account"}</CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialValue
              value={currentBalance}
              className="text-3xl font-semibold text-foreground"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net P/L</CardTitle>
            <CardDescription>All trades in your journal</CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialValue
              value={netPnl}
              sign="auto"
              className={cnProfit(netPnl)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account phase</CardTitle>
            <CardDescription>Latest account status</CardDescription>
          </CardHeader>
          <CardContent>
            {account ? <Badge variant="secondary">{account.phase}</Badge> : <Badge variant="secondary">Not set</Badge>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit target progress</CardTitle>
          <CardDescription>
            {account ? `Progress toward ${account.account_name}'s target.` : "Create an account to start tracking progress."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Net P/L</span>
            <FinancialValue value={netPnl} sign="auto" className={cnProfit(netPnl)} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <FinancialValue value={profitTarget} className="text-gold-bright" />
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-right text-xs text-muted-foreground tabular-finance">
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
