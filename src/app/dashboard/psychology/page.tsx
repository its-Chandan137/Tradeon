import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PsychologyForm } from "@/components/forms/psychology-form";
import { PsychologyHistoryTable } from "@/components/tables/psychology-history-table";

export default async function PsychologyPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from("psychology_journal")
    .select("*")
    .eq("user_id", user.id)
    .order("journal_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Psychology"
        title="Trading psychology journal"
        description="Track confidence, emotional state, setup discipline, mistakes, and lessons."
      />

      <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>New entry</CardTitle>
          </CardHeader>
          <CardContent>
            <PsychologyForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entry history</CardTitle>
          </CardHeader>
          <CardContent>
            <PsychologyHistoryTable entries={entries ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
