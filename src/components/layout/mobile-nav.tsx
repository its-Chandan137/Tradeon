"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  LayoutDashboard,
  Menu,
  PlusCircle,
  WalletCards,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "Account Manager", href: "/dashboard/accounts", icon: WalletCards },
  { name: "Add Trade", href: "/dashboard/trades", icon: PlusCircle },
  { name: "Psychology", href: "/dashboard/psychology", icon: BookOpenText },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-[#0B0E11]/95 px-3 sm:px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/overview" className="flex items-center gap-2 sm:gap-3">
          <div className="grid size-8 sm:size-9 place-items-center rounded-lg bg-gold text-[#0B0E11]">
            <span className="text-xs sm:text-sm font-semibold">T</span>
          </div>
          <span className="text-sm sm:text-base font-semibold">Tradeon</span>
        </Link>
        <Button variant="outline" size="icon" onClick={() => setOpen((value) => !value)} className="size-8 sm:size-9">
          <Menu className="size-4" />
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="fixed left-0 top-0 h-full w-72 border-r border-border bg-surface p-4 shadow-terminal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <Link href="/dashboard/overview" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                <div className="grid size-9 place-items-center rounded-lg bg-gold text-[#0B0E11]">
                  <span className="font-semibold">T</span>
                </div>
                <span className="font-semibold">Tradeon</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="size-8">
                <X className="size-4" />
              </Button>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
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
              <form action={logoutAction} className="mt-auto">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-surface-raised hover:text-foreground hover:translate-x-1">
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
