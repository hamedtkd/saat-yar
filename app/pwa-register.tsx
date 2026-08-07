"use client";

import { useEffect } from "react";
import {
  emitPwaEvent,
  PWA_EVENT,
  setDeferredInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-client";

function announceWaitingWorker(registration: ServiceWorkerRegistration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    emitPwaEvent(PWA_EVENT.updateAvailable);
  }
}

export function PwaRegister() {
  useEffect(() => {
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
      emitPwaEvent(PWA_EVENT.installAvailable);
    };
    const markInstalled = () => {
      setDeferredInstallPrompt(undefined);
      emitPwaEvent(PWA_EVENT.installed);
    };

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);

    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      return () => {
        window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
        window.removeEventListener("appinstalled", markInstalled);
      };
    }

    const base = document.querySelector('meta[name="saatyar-base"]')?.getAttribute("content") ?? "";
    const serviceWorkerUrl = `${base}/sw.js` || "/sw.js";
    const scope = `${base || ""}/`;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;

    const checkForUpdate = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void registration?.update().catch(() => undefined);
      }
    };

    void navigator.serviceWorker.register(serviceWorkerUrl, { scope }).then((nextRegistration) => {
      if (disposed) return;
      registration = nextRegistration;
      announceWaitingWorker(nextRegistration);
      nextRegistration.addEventListener("updatefound", () => {
        const worker = nextRegistration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed") announceWaitingWorker(nextRegistration);
        });
      });
    }).catch(() => {
      // PWA support is progressive; the web app remains usable without registration.
    });

    document.addEventListener("visibilitychange", checkForUpdate);
    window.addEventListener("online", checkForUpdate);

    return () => {
      disposed = true;
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
      window.removeEventListener("online", checkForUpdate);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);
  return null;
}
