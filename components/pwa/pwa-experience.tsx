"use client";

import { Download, RefreshCw, Share2, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AlertBanner } from "@/components/common/alert-banner";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { Button } from "@/components/ui/button";
import {
  getDeferredInstallPrompt,
  isIosLike,
  isStandalonePwa,
  PWA_EVENT,
  setDeferredInstallPrompt,
} from "@/lib/pwa-client";

export function PwaExperience() {
  const { requestNavigation } = useUnsavedNavigation();
  const [online, setOnline] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const syncConnection = () => setOnline(navigator.onLine);
    const syncInstall = () => setInstallAvailable(Boolean(getDeferredInstallPrompt()));
    const markInstalled = () => {
      setInstalled(true);
      setInstallAvailable(false);
    };
    const markUpdate = () => setUpdateAvailable(true);

    syncConnection();
    setInstalled(isStandalonePwa());
    syncInstall();

    window.addEventListener("online", syncConnection);
    window.addEventListener("offline", syncConnection);
    window.addEventListener(PWA_EVENT.installAvailable, syncInstall);
    window.addEventListener(PWA_EVENT.installed, markInstalled);
    window.addEventListener(PWA_EVENT.updateAvailable, markUpdate);
    return () => {
      window.removeEventListener("online", syncConnection);
      window.removeEventListener("offline", syncConnection);
      window.removeEventListener(PWA_EVENT.installAvailable, syncInstall);
      window.removeEventListener(PWA_EVENT.installed, markInstalled);
      window.removeEventListener(PWA_EVENT.updateAvailable, markUpdate);
    };
  }, []);

  const install = async () => {
    const prompt = getDeferredInstallPrompt();
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallAvailable(false);
      setDeferredInstallPrompt(undefined);
    }
  };

  const update = () => {
    requestNavigation(() => {
      void navigator.serviceWorker?.getRegistration().then((registration) => {
        const waiting = registration?.waiting;
        if (!waiting) {
          setUpdateAvailable(false);
          return;
        }
        setUpdating(true);
        let reloaded = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (reloaded) return;
          reloaded = true;
          window.location.reload();
        }, { once: true });
        waiting.postMessage({ type: "SKIP_WAITING" });
      });
    });
  };

  if (!online) {
    return (
      <PwaBanner>
        <AlertBanner tone="warning" icon={<WifiOff />} title="ساعت‌یار آفلاین است">
          داده‌های فعلی روی همین دستگاه در دسترس‌اند. برای دریافت نسخه جدید یا انتقال داده، دوباره به اینترنت وصل شو.
        </AlertBanner>
      </PwaBanner>
    );
  }

  if (updateAvailable) {
    return (
      <PwaBanner>
        <AlertBanner
          tone="info"
          icon={<RefreshCw />}
          title="نسخه جدید ساعت‌یار آماده است"
          action={<Button size="sm" onClick={update} disabled={updating}>{updating ? "در حال به‌روزرسانی…" : "به‌روزرسانی امن"}</Button>}
        >
          با تأیید تو نسخه جدید فعال می‌شود. اگر Draft ذخیره‌نشده داشته باشی، ساعت‌یار قبل از Reload هشدار می‌دهد.
        </AlertBanner>
      </PwaBanner>
    );
  }

  if (!installed && installAvailable && !installDismissed) {
    return (
      <PwaBanner>
        <AlertBanner
          tone="success"
          icon={<Download />}
          title="ساعت‌یار را مثل یک اپ نصب کن"
          action={
            <div className="flex items-center gap-1.5">
              <Button size="sm" onClick={() => { void install(); }}>نصب</Button>
              <Button size="icon" variant="ghost" className="size-9" onClick={() => setInstallDismissed(true)} aria-label="فعلاً نصب نکن"><X /></Button>
            </div>
          }
        >
          اجرای مستقل، آیکن اختصاصی و دسترسی سریع‌تر؛ داده‌ها همچنان Local-first باقی می‌مانند.
        </AlertBanner>
      </PwaBanner>
    );
  }

  if (!installed && isIosLike() && !installDismissed) {
    return (
      <PwaBanner>
        <AlertBanner
          tone="info"
          icon={<Share2 />}
          title="نصب ساعت‌یار روی iPhone یا iPad"
          action={<Button size="icon" variant="ghost" className="size-9" onClick={() => setInstallDismissed(true)} aria-label="بستن راهنمای نصب"><X /></Button>}
        >
          از منوی Share مرورگر، گزینه Add to Home Screen را انتخاب کن تا ساعت‌یار مثل یک اپ اجرا شود.
        </AlertBanner>
      </PwaBanner>
    );
  }

  return null;
}

function PwaBanner({ children }: { children: React.ReactNode }) {
  return <div className="shell-main-offset mx-auto mt-2 max-w-[1510px] print:hidden">{children}</div>;
}
