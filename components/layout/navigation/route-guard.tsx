"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  getFirstAllowedTab,
  getPathTab,
  getTabHref,
  getTodayHref,
  getTodayRouteMode,
  isPublicRoute,
  isSupplementalRoute,
  isTabAllowed,
  LAST_ROUTE_STORAGE_KEY,
  normalizePathname,
} from "@/lib/navigation";
import { isOnboardingReentry } from "@/lib/onboarding-session";
import type { Mode } from "@/lib/types";

const ONBOARDING_PATH = "/onboarding";

type RouteGuardProps = {
  mode: Mode;
  pathname: string;
  ready: boolean;
  onboarded: boolean;
};

export function RouteGuard({ mode, pathname, ready, onboarded }: RouteGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    const normalized = normalizePathname(pathname);
    const currentTab = getPathTab(normalized);
    const fallback = getTabHref(getFirstAllowedTab(mode), mode);
    const onboardingReentry = isOnboardingReentry(window.localStorage);

    if (isPublicRoute(normalized)) return;

    if (!onboarded || onboardingReentry) {
      if (normalized !== ONBOARDING_PATH) router.replace(ONBOARDING_PATH);
      return;
    }

    if (normalized === ONBOARDING_PATH) {
      router.replace(fallback);
      return;
    }

    if (isSupplementalRoute(normalized)) return;

    if (currentTab) {
      if (!isTabAllowed(mode, currentTab)) {
        router.replace(fallback);
        return;
      }
      const todayRouteMode = currentTab === "today" ? getTodayRouteMode(normalized) : null;
      if (currentTab === "today" && normalized === "/today") {
        router.replace(getTodayHref(mode));
        return;
      }
      if (todayRouteMode && todayRouteMode !== mode) {
        router.replace(getTodayHref(mode));
        return;
      }
      window.localStorage.setItem(LAST_ROUTE_STORAGE_KEY, getTabHref(currentTab, mode));
      return;
    }

    if (normalized === "/") {
      const storedPath = window.localStorage.getItem(LAST_ROUTE_STORAGE_KEY) ?? "";
      const storedTab = getPathTab(storedPath);
      router.replace(storedTab && isTabAllowed(mode, storedTab) ? getTabHref(storedTab, mode) : fallback);
      return;
    }

    router.replace(fallback);
  }, [mode, onboarded, pathname, ready, router]);

  return null;
}
