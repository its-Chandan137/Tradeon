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
    <div className="relative min-h-screen bg-[#0B0E11]">
      <div className="pointer-events-none fixed inset-0 -z-10 ambient-grid" aria-hidden />
      <DashboardSidebar />
      <div className="flex min-h-screen flex-col md:pl-72">
        <MobileNav />
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
