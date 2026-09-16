"use client";

import { Download, RefreshCw, Share2, WifiOff, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { FloatingNotice } from "@/components/common/floating-notice";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { Button } from "@/components/ui/button";
import { getDeferredInstallPrompt, isIosLike, isStandalonePwa, PWA_EVENT, setDeferredInstallPrompt } from "@/lib/pwa-client";

const noopSubscribe = () => () => {};
function subscribeOnline(onStoreChange: () => void) { window.addEventListener("online", onStoreChange); window.addEventListener("offline", onStoreChange); return () => { window.removeEventListener("online", onStoreChange); window.removeEventListener("offline", onStoreChange); }; }
function subscribeStandalone(onStoreChange: () => void) { const media = window.matchMedia("(display-mode: standalone)"); media.addEventListener("change", onStoreChange); window.addEventListener(PWA_EVENT.installed, onStoreChange); return () => { media.removeEventListener("change", onStoreChange); window.removeEventListener(PWA_EVENT.installed, onStoreChange); }; }
function subscribeInstallPrompt(onStoreChange: () => void) { window.addEventListener(PWA_EVENT.installAvailable, onStoreChange); window.addEventListener(PWA_EVENT.installed, onStoreChange); return () => { window.removeEventListener(PWA_EVENT.installAvailable, onStoreChange); window.removeEventListener(PWA_EVENT.installed, onStoreChange); }; }

export function PwaExperience() {
  const { s } = useSystemUi();
  const { requestNavigation } = useUnsavedNavigation();
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const standalone = useSyncExternalStore(subscribeStandalone, isStandalonePwa, () => false);
  const installAvailable = useSyncExternalStore(subscribeInstallPrompt, () => Boolean(getDeferredInstallPrompt()), () => false);
  const iosLike = useSyncExternalStore(noopSubscribe, isIosLike, () => false);
  const [installedByEvent, setInstalledByEvent] = useState(false); const [updateAvailable, setUpdateAvailable] = useState(false); const [installDismissed, setInstallDismissed] = useState(false); const [updating, setUpdating] = useState(false);
  const installed = standalone || installedByEvent;
  useEffect(() => { const markInstalled = () => setInstalledByEvent(true); const markUpdate = () => setUpdateAvailable(true); window.addEventListener(PWA_EVENT.installed, markInstalled); window.addEventListener(PWA_EVENT.updateAvailable, markUpdate); return () => { window.removeEventListener(PWA_EVENT.installed, markInstalled); window.removeEventListener(PWA_EVENT.updateAvailable, markUpdate); }; }, []);
  const install = async () => { const prompt = getDeferredInstallPrompt(); if (!prompt) return; await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === "accepted") setDeferredInstallPrompt(undefined); };
  const update = () => { requestNavigation(() => { void navigator.serviceWorker?.getRegistration().then((registration) => { const waiting = registration?.waiting; if (!waiting) { setUpdateAvailable(false); return; } setUpdating(true); let reloaded = false; navigator.serviceWorker.addEventListener("controllerchange", () => { if (reloaded) return; reloaded = true; window.location.reload(); }, { once: true }); waiting.postMessage({ type: "SKIP_WAITING" }); }); }); };
  if (!online) return <FloatingNotice tone="warning" icon={<WifiOff className="size-4.5" />} title={s("Saatyar is offline")} description={s("Your current data is still available on this device. Reconnect to get updates or transfer data.")} />;
  if (updateAvailable) return <FloatingNotice tone="info" icon={<RefreshCw className="size-4.5" />} title={s("A new Saatyar version is ready")} description={s("The new version activates only after you confirm. If you have an unsaved draft, Saatyar warns before reload.")} action={<Button size="sm" onClick={update} disabled={updating}>{updating ? s("Updating…") : s("Safe update")}</Button>} />;
  if (!installed && installAvailable && !installDismissed) return <FloatingNotice tone="success" icon={<Download className="size-4.5" />} title={s("Install Saatyar like an app")} description={s("Standalone launch, a dedicated icon, and faster access; data remains local-first.")} action={<div className="flex items-center gap-1.5"><Button size="sm" onClick={() => { void install(); }}>{s("Install")}</Button><Button size="icon" variant="ghost" className="size-9" onClick={() => setInstallDismissed(true)} aria-label={s("Not now")}><X /></Button></div>} />;
  if (!installed && iosLike && !installDismissed) return <FloatingNotice tone="info" icon={<Share2 className="size-4.5" />} title={s("Install Saatyar on iPhone or iPad")} description={s("From the browser Share menu, choose Add to Home Screen to run Saatyar like an app.")} action={<Button size="icon" variant="ghost" className="size-9" onClick={() => setInstallDismissed(true)} aria-label={s("Close install guide")}><X /></Button>} />;
  return null;
}
