import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account Manager"
        title="Trading accounts"
        description="Create and manage the funded or evaluation accounts that power your journal."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{accounts?.length ? "Add another account" : "Create your first account"}</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountTable accounts={accounts ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
