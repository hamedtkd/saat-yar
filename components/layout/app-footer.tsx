"use client";

import { CircleHelp, FileText, Info, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { GitHubStarLink } from "@/components/layout/github-star-link";
import { GuardedLink } from "@/components/layout/navigation/guarded-link";

const footerLinkClass = "inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 font-bold text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]";

export function AppFooter({ online }: { online: boolean }) {
  const { t } = useLocale();
  return (
    <footer className="mx-auto grid min-h-12 max-w-[var(--shell-content-max)] grid-cols-[auto_1fr] items-center gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] px-3 py-2 text-[10px] text-[var(--text-muted)] max-[820px]:grid-cols-1 max-[820px]:items-stretch print:hidden">
      <span className="flex items-center gap-2 px-1">
        {online ? <Wifi className="size-4 text-[var(--accent-strong)]" /> : <WifiOff className="size-4 text-[var(--warning)]" />}
        {online ? t("footer.online") : t("footer.offline")}
      </span>
      <div className="flex flex-wrap items-center justify-end gap-1 max-[820px]:justify-start">
        <GuardedLink href="/about" className={footerLinkClass}><Info className="size-3.5" />{t("footer.about")}</GuardedLink>
        <GuardedLink href="/help" className={footerLinkClass}><CircleHelp className="size-3.5" />{t("footer.help")}</GuardedLink>
        <GuardedLink href="/privacy" className={footerLinkClass}><ShieldCheck className="size-3.5" />{t("footer.privacy")}</GuardedLink>
        <GuardedLink href="/terms" className={footerLinkClass}><FileText className="size-3.5" />{t("footer.terms")}</GuardedLink>
        <GitHubStarLink online={online} />
      </div>
    </footer>
  );
}
