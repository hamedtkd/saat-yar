"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearBrowserFirstRunGuide,
  FIRST_RUN_GUIDE_CHANGE_EVENT,
  FIRST_RUN_GUIDE_STORAGE_KEY,
  getBrowserFirstRunGuidePending,
} from "@/lib/first-run-guide";

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === FIRST_RUN_GUIDE_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(FIRST_RUN_GUIDE_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FIRST_RUN_GUIDE_CHANGE_EVENT, listener);
  };
}

export function useFirstRunGuide() {
  const pending = useSyncExternalStore(subscribe, getBrowserFirstRunGuidePending, () => false);
  const dismiss = useCallback(() => {
    clearBrowserFirstRunGuide();
  }, []);
  return { pending, dismiss };
}
