"use client";

import { useSyncExternalStore } from "react";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  getProductAnalyticsConsent,
  setProductAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/product-analytics";

function subscribe(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === ANALYTICS_CONSENT_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onStoreChange);
  };
}

function getServerSnapshot(): AnalyticsConsent {
  return "unset";
}

export function useProductAnalyticsConsent() {
  const consent = useSyncExternalStore(subscribe, getProductAnalyticsConsent, getServerSnapshot);
  return {
    consent,
    grant: () => setProductAnalyticsConsent("granted"),
    deny: () => setProductAnalyticsConsent("denied"),
  };
}
