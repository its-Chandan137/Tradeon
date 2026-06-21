import { requireUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();

  return (
    <div className="min-h-screen bg-[#0B0E11]">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <MobileNav />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
