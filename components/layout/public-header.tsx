"use client";

import Link from "next/link";
import { CircleHelp, Home, Settings } from "lucide-react";
import { BrandMark } from "@/components/common/brand-mark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";
import type { AppearanceSettings, ThemeMode } from "@/lib/types";
import { getPublicNavigationLabels } from "@/lib/public-navigation-content";

const linkClass = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] font-bold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] max-[460px]:size-10 max-[460px]:px-0";

export function PublicHeader({
  appearance,
  onThemeModeChange,
}: {
  appearance: AppearanceSettings;
  onThemeModeChange: (mode: ThemeMode) => void;
}) {
  const { locale, t } = useLocale();
  const copy = getPublicNavigationLabels(locale);

  return (
    <header
      data-public-header
      className="sticky top-2 z-50 mx-auto flex w-full min-w-0 max-w-5xl items-center justify-between gap-2 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] px-3 py-2 shadow-[0_6px_20px_rgba(0,0,0,.035)] backdrop-blur-xl sm:px-4"
    >
      <Link href="/today" className="flex min-w-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]">
        <BrandMark size={34} animated={false} label={t("app.logoLabel")} />
        <strong className="truncate text-[12px] text-[var(--text)] max-[520px]:hidden">{copy.brand}</strong>
      </Link>

      <nav className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2" aria-label={copy.help}>
        <Link href="/today" className={linkClass} title={copy.app} aria-label={copy.app}>
          <Home className="size-4" /><span className="max-[460px]:sr-only">{copy.app}</span>
        </Link>
        <Link href="/settings" className={linkClass} title={copy.settings} aria-label={copy.settings}>
          <Settings className="size-4" /><span className="max-[460px]:sr-only">{copy.settings}</span>
        </Link>
        <Link href="/help" className={linkClass} title={copy.help} aria-label={copy.help}>
          <CircleHelp className="size-4" /><span className="max-[460px]:sr-only">{copy.help}</span>
        </Link>
        <LanguageSwitcher variant="compact" className="shrink-0" />
        <ThemeToggle
          className={cn("size-10 min-h-10 min-w-10 rounded-xl")}
          appearance={appearance}
          onChange={onThemeModeChange}
        />
      </nav>
    </header>
  );
}
