"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  getFirstAllowedTab,
  getPathTab,
  getTabHref,
  isSupplementalRoute,
  isTabAllowed,
  LAST_ROUTE_STORAGE_KEY,
  normalizePathname,
} from "@/lib/navigation";
import type { Mode } from "@/lib/types";

type RouteGuardProps = {
  mode: Mode;
  pathname: string;
  ready: boolean;
};

export function RouteGuard({ mode, pathname, ready }: RouteGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    const normalized = normalizePathname(pathname);
    const currentTab = getPathTab(normalized);
    const fallback = getTabHref(getFirstAllowedTab(mode));

    if (isSupplementalRoute(normalized)) return;

    if (currentTab) {
      if (!isTabAllowed(mode, currentTab)) {
        router.replace(fallback);
        return;
      }
      window.localStorage.setItem(LAST_ROUTE_STORAGE_KEY, getTabHref(currentTab));
      return;
    }

    if (normalized === "/") {
      const storedPath = window.localStorage.getItem(LAST_ROUTE_STORAGE_KEY) ?? "";
      const storedTab = getPathTab(storedPath);
      router.replace(storedTab && isTabAllowed(mode, storedTab) ? getTabHref(storedTab) : fallback);
      return;
    }

    router.replace(fallback);
  }, [mode, pathname, ready, router]);

  return null;
}
