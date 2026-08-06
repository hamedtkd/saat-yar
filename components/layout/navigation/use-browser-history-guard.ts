"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type BrowserHistoryGuardOptions = {
  hasUnsavedChanges: boolean;
  requestNavigation: (navigate: () => void) => void;
};

export function useBrowserHistoryGuard({
  hasUnsavedChanges,
  requestNavigation,
}: BrowserHistoryGuardOptions) {
  const pathname = usePathname();
  const acceptedHref = useRef<string | null>(null);
  const hasUnsavedRef = useRef(hasUnsavedChanges);
  const requestNavigationRef = useRef(requestNavigation);

  useEffect(() => {
    hasUnsavedRef.current = hasUnsavedChanges;
    requestNavigationRef.current = requestNavigation;
  }, [hasUnsavedChanges, requestNavigation]);

  useEffect(() => {
    acceptedHref.current = window.location.href;
  }, [pathname]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const targetHref = window.location.href;
      const currentHref = acceptedHref.current;

      if (!currentHref || !hasUnsavedRef.current) {
        acceptedHref.current = targetHref;
        return;
      }
      if (targetHref === currentHref) return;

      event.stopImmediatePropagation();
      window.history.pushState(window.history.state, "", currentHref);

      requestNavigationRef.current(() => {
        acceptedHref.current = targetHref;
        window.location.assign(targetHref);
      });
    };

    window.addEventListener("popstate", handlePopState, true);
    return () => window.removeEventListener("popstate", handlePopState, true);
  }, []);
}
