"use client";

import { CircleHelp, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { GuardedLink } from "@/components/layout/navigation/guarded-link";

export function AppFooter({ online }: { online: boolean }) {
  const { t } = useLocale();
  return (
    <footer className="mx-auto flex min-h-12 max-w-[var(--shell-content-max)] items-center justify-between gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] px-4 text-[10px] text-[var(--text-muted)] max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:gap-3 max-[720px]:py-3 print:hidden">
      <span className="flex items-center gap-2">
        {online ? <Wifi className="size-4 text-[var(--accent-strong)]" /> : <WifiOff className="size-4 text-[var(--warning)]" />}
        {online ? t("footer.online") : t("footer.offline")}
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[var(--accent-strong)]" />
          {t("footer.privacy")}
        </span>
        <GuardedLink
          href="/about"
          className="inline-flex items-center gap-1.5 font-bold text-[var(--accent-strong)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          <CircleHelp className="size-4" />
          {t("footer.help")}
        </GuardedLink>
      </div>
    </footer>
  );
}
