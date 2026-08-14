"use client";

import { useEffect } from "react";
import {
  getAnalyticsRoute,
  getFeatureForRoute,
  markFeatureDiscovered,
  trackProductAnalytics,
} from "@/lib/product-analytics";

export function ProductAnalyticsRuntime({ pathname, saveError }: { pathname: string; saveError?: boolean }) {
  useEffect(() => {
    const route = getAnalyticsRoute(pathname);
    if (!route) return;
    trackProductAnalytics({ name: "route_viewed", properties: { route } });
    const feature = getFeatureForRoute(route);
    if (feature) markFeatureDiscovered(feature);
  }, [pathname]);

  useEffect(() => {
    if (saveError) trackProductAnalytics({ name: "ux_error", properties: { area: "persistence", code: "save-error" } });
  }, [saveError]);

  useEffect(() => {
    const onError = () => trackProductAnalytics({ name: "ux_error", properties: { area: "runtime", code: "window-error" } });
    const onUnhandled = () => trackProductAnalytics({ name: "ux_error", properties: { area: "runtime", code: "unhandled-rejection" } });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandled);
    };
  }, []);

  return null;
}
