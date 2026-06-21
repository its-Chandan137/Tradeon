import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeForm } from "@/components/forms/trade-form";
import { TradeHistoryTable } from "@/components/tables/trade-history-table";

export default async function TradesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: accounts, error: accountsError }, { data: trades, error: tradesError }] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, account_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (accountsError) {
    throw accountsError;
  }

  if (tradesError) {
    throw tradesError;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Add Trade"
        title="Log a trade"
        description="Capture execution details, upload a screenshot, and calculate generic P/L without instrument-specific multipliers."
      />

      <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Trade details</CardTitle>
          </CardHeader>
          <CardContent>
            <TradeForm accounts={accounts ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trade history</CardTitle>
          </CardHeader>
          <CardContent>
            <TradeHistoryTable trades={trades ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
