"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
      <div className="flex h-20 items-center border-b border-border px-6">
        <Link href="/dashboard/overview" className="group flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-gold text-[#0B0E11] shadow-glow">
            <span className="font-semibold">T</span>
          </div>
          <div>
            <p className="font-semibold tracking-tight text-foreground">Tradeon</p>
            <p className="text-xs text-muted-foreground">Trading journal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gold text-[#0B0E11] shadow-sm"
                  : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
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
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
