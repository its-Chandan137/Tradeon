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
    <div className="sticky top-0 z-40 border-b border-border bg-[#0B0E11]/90 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/overview" className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-gold text-[#0B0E11]">
            <span className="font-semibold">T</span>
          </div>
          <span className="font-semibold">Tradeon</span>
        </Link>
        <Button variant="outline" size="icon" onClick={() => setOpen((value) => !value)}>
          <Menu className="size-4" />
        </Button>
      </div>

      {open && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-3 shadow-terminal">
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
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-gold text-[#0B0E11]"
                      : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.name}
                </Link>
              );
            })}
            <form action={() => logoutAction()}>
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface-raised hover:text-foreground">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      )}
    </div>
  );
}
