"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import nprogress from "nprogress";

export function NavigationProgressProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    nprogress.done();
  }, [pathname, searchParams]);

  return null;
}
