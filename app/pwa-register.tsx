"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const base = document.querySelector('meta[name="saatyar-base"]')?.getAttribute("content") ?? "";
    void navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base || "/"}/` });
  }, []);
  return null;
}
