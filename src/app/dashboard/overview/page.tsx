import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { OverviewContent } from "@/components/overview/overview-content";

export default async function OverviewPage() {
  await requireUser();

  return (
    <div className="w-full overflow-x-hidden space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Trading dashboard"
        description="A concise view of your active account, progress, and total journal performance."
      />
      <OverviewContent />
    </div>
  );
}
