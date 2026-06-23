import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountForm } from "@/components/forms/account-form";
import { AccountTable } from "@/components/tables/account-table";

export default async function AccountsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      <PageHeader
        eyebrow="Account Manager"
        title="Trading accounts"
        description="Create and manage the funded or evaluation accounts that power your journal."
      />

      <Card className="card-sheen">
        <CardContent className="p-4 sm:p-5">
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="mb-4 sm:mb-5 grid grid-cols-2">
              <TabsTrigger value="add" className="text-sm">Add Account</TabsTrigger>
              <TabsTrigger value="history" className="text-sm">Your accounts</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="mt-0">
              <AccountForm />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <AccountTable accounts={accounts ?? []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
