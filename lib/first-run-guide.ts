export const FIRST_RUN_GUIDE_STORAGE_KEY = "saatyar-first-run-guide-v1";
export const FIRST_RUN_GUIDE_CHANGE_EVENT = "saatyar:first-run-guide-change";

type FirstRunStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getBrowserStorage(): FirstRunStorage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function isFirstRunGuidePending(storage?: Pick<FirstRunStorage, "getItem">) {
  if (!storage) return false;
  try {
    return storage.getItem(FIRST_RUN_GUIDE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markFirstRunGuidePending(storage?: Pick<FirstRunStorage, "setItem">) {
  if (!storage) return;
  try {
    storage.setItem(FIRST_RUN_GUIDE_STORAGE_KEY, "1");
  } catch {
    // First-run guidance is optional and must never block onboarding completion.
  }
}

export function clearFirstRunGuide(storage?: Pick<FirstRunStorage, "removeItem">) {
  if (!storage) return;
  try {
    storage.removeItem(FIRST_RUN_GUIDE_STORAGE_KEY);
  } catch {
    // Dismissing the optional guide must remain safe when storage is unavailable.
  }
}

export function getBrowserFirstRunGuidePending() {
  return isFirstRunGuidePending(getBrowserStorage());
}

export function markBrowserFirstRunGuidePending() {
  markFirstRunGuidePending(getBrowserStorage());
  if (typeof window !== "undefined") window.dispatchEvent(new Event(FIRST_RUN_GUIDE_CHANGE_EVENT));
}

export function clearBrowserFirstRunGuide() {
  clearFirstRunGuide(getBrowserStorage());
  if (typeof window !== "undefined") window.dispatchEvent(new Event(FIRST_RUN_GUIDE_CHANGE_EVENT));
}
