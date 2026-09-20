"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, Clipboard, Laptop, MoonStar, Power, Rocket } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRuntimePreferences } from "@/hooks/use-runtime-preferences";
import { getAutoStartSetup } from "@/lib/pwa-autostart";
import { getDeferredInstallPrompt, isStandalonePwa, PWA_EVENT, setDeferredInstallPrompt } from "@/lib/pwa-client";

const noopSubscribe = () => () => {};
function subscribeStandalone(listener: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", listener);
  window.addEventListener(PWA_EVENT.installed, listener);
  return () => {
    media.removeEventListener("change", listener);
    window.removeEventListener(PWA_EVENT.installed, listener);
  };
}
function subscribeInstall(listener: () => void) {
  window.addEventListener(PWA_EVENT.installAvailable, listener);
  window.addEventListener(PWA_EVENT.installed, listener);
  return () => {
    window.removeEventListener(PWA_EVENT.installAvailable, listener);
    window.removeEventListener(PWA_EVENT.installed, listener);
  };
}

export function RuntimeBehaviorCard({ setToast }: { setToast: (message: string) => void }) {
  const { s } = useSystemUi();
  const { value, update } = useRuntimePreferences();
  const [showStartupGuide, setShowStartupGuide] = useState(false);
  const standalone = useSyncExternalStore(subscribeStandalone, isStandalonePwa, () => false);
  const installAvailable = useSyncExternalStore(subscribeInstall, () => Boolean(getDeferredInstallPrompt()), () => false);
  const userAgent = useSyncExternalStore(noopSubscribe, () => navigator.userAgent, () => "");
  const setup = getAutoStartSetup(userAgent);

  const install = async () => {
    const prompt = getDeferredInstallPrompt();
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredInstallPrompt(undefined);
      setToast(s("Saatyar was installed. Now enable auto-start from the browser app settings."));
    }
  };

  const copyAppsUrl = async () => {
    try {
      await navigator.clipboard.writeText(setup.internalUrl);
      setToast(s("Browser app settings address was copied."));
    } catch {
      setToast(s("Copy failed. Open the browser apps page manually."));
    }
  };

  return (
    <section id="settings-runtime" className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5">
      <PanelHead icon={<Laptop />} title={s("Runtime and device behavior")}>
        <StatusBadge tone={value.pauseTimersOnSystemSuspend ? "success" : "warning"}>{value.pauseTimersOnSystemSuspend ? s("Sleep protection on") : s("Sleep protection off")}</StatusBadge>
      </PanelHead>

      <div className="mt-4 grid gap-3">
        <label className="flex items-start gap-3 rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <Checkbox className="mt-0.5" checked={value.pauseTimersOnSystemSuspend} onCheckedChange={(checked) => update({ pauseTimersOnSystemSuspend: checked })} />
          <span className="grid gap-1">
            <strong className="flex items-center gap-2 text-[11px] text-[var(--text)]"><MoonStar className="size-4 text-[var(--accent-strong)]" />{s("Pause active timers when the system sleeps or hibernates")}</strong>
            <small className="text-[9px] leading-5 text-[var(--text-muted)]">{s("Saatyar keeps a local heartbeat. After a real system suspension, attendance is closed and project timers are paused at the last saved activity instead of counting sleep time.")}</small>
          </span>
        </label>

        <div className="rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid min-w-0 flex-1 gap-1">
              <strong className="flex items-center gap-2 text-[11px] text-[var(--text)]"><Power className="size-4 text-[var(--accent-strong)]" />{s("Open Saatyar when you sign in to the computer")}</strong>
              <small className="text-[9px] leading-5 text-[var(--text-muted)]">{s("Chrome and Edge support starting installed web apps at OS login, but browsers do not allow a website to switch this OS permission on by itself. Saatyar keeps the setup guide here and remembers whether you configured it on this device.")}</small>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={value.autoStartConfigured ? "success" : standalone ? "info" : "neutral"}>{value.autoStartConfigured ? s("Configured") : standalone ? s("Installed app") : s("Install first")}</StatusBadge>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowStartupGuide((current) => !current)}><Rocket />{showStartupGuide ? s("Hide setup") : s("Set up auto-start")}</Button>
            </div>
          </div>

          {showStartupGuide && <div className="mt-4 grid gap-3 border-t border-[var(--border)] pt-4">
            {!standalone && installAvailable && <Button type="button" className="justify-self-start" onClick={() => void install()}><Rocket />{s("Install Saatyar first")}</Button>}
            <ol className="grid gap-2 text-[10px] leading-6 text-[var(--text-muted)]">
              <li><strong className="text-[var(--text)]">1.</strong> {standalone ? s("Saatyar is installed as an app on this device.") : s("Install Saatyar as a desktop app from Chrome or Edge.")}</li>
              <li><strong className="text-[var(--text)]">2.</strong> {s("Open the browser apps page: {address}", { address: setup.internalUrl })} <Button type="button" size="sm" variant="ghost" className="ms-1 h-7 px-2" onClick={() => void copyAppsUrl()}><Clipboard className="size-3.5" />{s("Copy address")}</Button></li>
              <li><strong className="text-[var(--text)]">3.</strong> {s("Find Saatyar and enable the browser option that starts the app when you sign in to the operating system.")}</li>
            </ol>
            <label className="flex items-center gap-2 text-[10px] font-semibold text-[var(--text)]">
              <Checkbox checked={value.autoStartConfigured} onCheckedChange={(checked) => update({ autoStartConfigured: checked })} />
              <CheckCircle2 className="size-4 text-[var(--success)]" />
              {s("I enabled auto-start for Saatyar on this device")}
            </label>
            <p className="text-[9px] leading-5 text-[var(--text-muted)]">{s("This confirmation is device-only and is not included in backups. The actual auto-start permission remains controlled by your browser and operating system.")}</p>
          </div>}
        </div>
      </div>
    </section>
  );
}
