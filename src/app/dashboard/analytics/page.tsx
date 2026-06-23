import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { AnalyticsContent } from "@/components/analytics/analytics-content";

export default async function AnalyticsPage() {
  await requireUser();

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Performance analytics"
        description="Review win rate, P/L distribution, equity progression, and breakdowns by instrument and direction."
      />
      <AnalyticsContent />
    </div>
  );
}
