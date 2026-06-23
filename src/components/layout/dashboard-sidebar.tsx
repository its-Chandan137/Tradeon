"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import nprogress from "nprogress";
import {
  BarChart3,
  BookOpenText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  WalletCards,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "Account Manager", href: "/dashboard/accounts", icon: WalletCards },
  { name: "Add Trade", href: "/dashboard/trades", icon: PlusCircle },
  { name: "Psychology", href: "/dashboard/psychology", icon: BookOpenText },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    nprogress.start();
    router.push(href);
  };

  return (
    <div className="fixed left-0 top-0 z-30 hidden h-screen w-72 shrink-0 overflow-hidden border-r border-border bg-surface md:flex md:flex-col">
      <div className="flex h-20 shrink-0 items-center border-b border-border px-6">
        <Link href="/dashboard/overview" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="grid size-9 place-items-center rounded-lg bg-gold text-[#0B0E11] shadow-glow transition-transform group-hover:scale-105">
            <span className="font-semibold">T</span>
          </div>
          <div>
            <p className="font-semibold tracking-tight text-foreground">Tradeon</p>
            <p className="text-xs text-muted-foreground">Trading journal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gold text-[#0B0E11] shadow-sm"
                  : "text-muted-foreground hover:bg-surface-raised hover:text-foreground hover:translate-x-1",
              )}
            >
              <Icon className="size-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-surface-raised hover:text-foreground hover:translate-x-1"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
