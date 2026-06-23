import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="w-full overflow-x-hidden space-y-6">
      <PageHeader
        eyebrow="Psychology"
        title="Trading psychology journal"
        description="Track confidence, emotional state, setup discipline, mistakes, and lessons."
      />

      <Card className="card-sheen">
        <CardContent className="p-4 sm:p-5">
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="mb-4 sm:mb-5 grid grid-cols-2">
              <TabsTrigger value="add" className="text-sm">Add Entry</TabsTrigger>
              <TabsTrigger value="history" className="text-sm">Entry History</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="mt-0">
              <PsychologyForm />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <PsychologyHistoryTable entries={entries ?? []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
