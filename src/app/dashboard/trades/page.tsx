import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="w-full overflow-x-hidden space-y-6">
      <PageHeader
        eyebrow="Add Trade"
        title="Log a trade"
        description="Capture execution details, upload a screenshot, and calculate P/L with instrument-aware multipliers."
      />

      <Card className="card-sheen">
        <CardContent className="p-4 sm:p-5">
          <Tabs defaultValue="log" className="w-full">
            <TabsList className="mb-4 sm:mb-5 grid grid-cols-2">
              <TabsTrigger value="log" className="text-sm">Log Trade</TabsTrigger>
              <TabsTrigger value="history" className="text-sm">Trade History</TabsTrigger>
            </TabsList>

            <TabsContent value="log" className="mt-0">
              <TradeForm accounts={accounts ?? []} />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <TradeHistoryTable trades={trades ?? []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
