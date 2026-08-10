"use client";

import { Check, Globe2 } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

const choices: readonly { locale: Locale; labelKey: "settings.language.persian" | "settings.language.english"; detailKey: "settings.language.persianDetail" | "settings.language.englishDetail" }[] = [
  { locale: "fa-IR", labelKey: "settings.language.persian", detailKey: "settings.language.persianDetail" },
  { locale: "en", labelKey: "settings.language.english", detailKey: "settings.language.englishDetail" },
];

export function LanguageSettingsCard() {
  const { locale, setLocale, t } = useLocale();
  const activeLanguage = locale === "en" ? t("settings.language.english") : t("settings.language.persian");

  return (
    <section
      id="settings-language"
      data-settings-language
      data-locale={locale}
      className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5"
    >
      <PanelHead icon={<Globe2 />} title={t("settings.language.title")} />
      <p className="mb-4 text-[11px] leading-6 text-[var(--text-muted)]">{t("settings.language.description")}</p>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t("settings.language.title")}>
        {choices.map((choice) => {
          const active = choice.locale === locale;
          return (
            <button
              key={choice.locale}
              type="button"
              role="radio"
              aria-checked={active}
              data-locale-choice={choice.locale}
              onClick={() => setLocale(choice.locale)}
              className={cn(
                "flex min-h-[82px] items-center gap-3 rounded-[16px] border bg-[var(--surface-2)] p-3 text-start transition-colors",
                "hover:border-[color-mix(in_srgb,var(--accent)_38%,var(--border))] hover:bg-[var(--accent-soft)]",
                active
                  ? "border-[color-mix(in_srgb,var(--accent)_52%,var(--border))] bg-[var(--accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
                  : "border-[var(--dashboard-border)]",
              )}
            >
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl border", active ? "border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-foreground)]" : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)]") }>
                {active ? <Check aria-hidden="true" className="size-4" /> : <Globe2 aria-hidden="true" className="size-4" />}
              </span>
              <span className="min-w-0">
                <strong className="block text-sm text-[var(--text)]">{t(choice.labelKey)}</strong>
                <span className="mt-1 block text-[10px] leading-5 text-[var(--text-muted)]">{t(choice.detailKey)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-[var(--surface-2)] px-3 py-2 text-[10px] leading-5 text-[var(--text-muted)]">
        <span>{t("settings.language.persist")}</span>
        <strong data-active-locale className="text-[var(--accent-strong)]">{t("settings.language.current", { language: activeLanguage })}</strong>
      </div>
    </section>
  );
}
