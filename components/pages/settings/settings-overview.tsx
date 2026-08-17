"use client";

import { ArrowLeft } from "lucide-react";
import { GuardedLink } from "@/components/layout/navigation/guarded-link";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { settingsRoutes } from "./settings-route-model";

export function SettingsOverview() {
  const { t, direction } = useLocale();
  return (
    <section data-settings-overview className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {settingsRoutes.map(({ id, href, labelKey, descriptionKey, icon: Icon }) => (
        <GuardedLink
          key={id}
          href={href}
          className="group flex min-h-36 flex-col justify-between rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-4 transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--dashboard-border))] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          <div>
            <span className="grid size-10 place-items-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent-strong)] group-hover:bg-[var(--surface-1)]"><Icon aria-hidden="true" className="size-5" /></span>
            <strong className="mt-3 block text-sm text-[var(--text)]">{t(labelKey)}</strong>
            <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-[var(--text-muted)]">{t(descriptionKey)}</p>
          </div>
          <span className="mt-3 flex items-center gap-1 text-[9px] font-black text-[var(--accent-strong)]">{t("settings.openSection")}<ArrowLeft aria-hidden className={cn("size-3.5", direction === "ltr" && "rotate-180")} /></span>
        </GuardedLink>
      ))}
    </section>
  );
}
