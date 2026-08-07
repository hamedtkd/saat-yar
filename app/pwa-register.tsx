"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
    const base = document.querySelector('meta[name="saatyar-base"]')?.getAttribute("content") ?? "";
    const serviceWorkerUrl = `${base}/sw.js` || "/sw.js";
    const scope = `${base || ""}/`;
    void navigator.serviceWorker.register(serviceWorkerUrl, { scope }).catch(() => {
      // PWA support is progressive; the web app remains usable without registration.
    });
  }, []);
  return null;
}
