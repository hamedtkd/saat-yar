export type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

export const PWA_EVENT = {
  installAvailable: "saatyar:pwa-install-available",
  installed: "saatyar:pwa-installed",
  updateAvailable: "saatyar:pwa-update-available",
} as const;

declare global {
  interface Window {
    __saatyarInstallPrompt?: BeforeInstallPromptEvent;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

export function isIosLike() {
  if (typeof navigator === "undefined") return false;
  const platform = navigator.userAgent || "";
  const touchMac = /Macintosh/i.test(platform) && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/i.test(platform) || touchMac;
}

export function getDeferredInstallPrompt() {
  return typeof window === "undefined" ? undefined : window.__saatyarInstallPrompt;
}

export function setDeferredInstallPrompt(event?: BeforeInstallPromptEvent) {
  if (typeof window === "undefined") return;
  window.__saatyarInstallPrompt = event;
}

export function emitPwaEvent(name: (typeof PWA_EVENT)[keyof typeof PWA_EVENT]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(name));
}
