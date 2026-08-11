"use client";

import { CalendarDays, Check, Globe2 } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";
import type { CalendarPreference, Locale } from "@/lib/i18n";

const languageChoices: readonly {
  locale: Locale;
  labelKey: "settings.language.persian" | "settings.language.english";
  detailKey: "settings.language.persianDetail" | "settings.language.englishDetail";
}[] = [
  { locale: "fa-IR", labelKey: "settings.language.persian", detailKey: "settings.language.persianDetail" },
  { locale: "en", labelKey: "settings.language.english", detailKey: "settings.language.englishDetail" },
];

const calendarChoices: readonly {
  preference: CalendarPreference;
  labelKey: "settings.calendar.auto" | "settings.calendar.persian" | "settings.calendar.gregorian";
  detailKey: "settings.calendar.autoDetail" | "settings.calendar.persianDetail" | "settings.calendar.gregorianDetail";
}[] = [
  { preference: "auto", labelKey: "settings.calendar.auto", detailKey: "settings.calendar.autoDetail" },
  { preference: "persian", labelKey: "settings.calendar.persian", detailKey: "settings.calendar.persianDetail" },
  { preference: "gregory", labelKey: "settings.calendar.gregorian", detailKey: "settings.calendar.gregorianDetail" },
];

function ChoiceMark({ active, kind }: { active: boolean; kind: "language" | "calendar" }) {
  const Icon = kind === "calendar" ? CalendarDays : Globe2;
  return (
    <span className={cn(
      "grid size-9 shrink-0 place-items-center rounded-xl border",
      active
        ? "border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-foreground)]"
        : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)]",
    )}>
      {active ? <Check aria-hidden="true" className="size-4" /> : <Icon aria-hidden="true" className="size-4" />}
    </span>
  );
}

export function LanguageSettingsCard() {
  const { calendar, calendarPreference, locale, setCalendarPreference, setLocale, t } = useLocale();
  const activeLanguage = locale === "en" ? t("settings.language.english") : t("settings.language.persian");
  const activeCalendar = calendar === "gregory" ? t("settings.calendar.gregorian") : t("settings.calendar.persian");

  return (
    <section
      id="settings-language"
      data-settings-language
      data-locale={locale}
      data-calendar={calendar}
      data-calendar-preference={calendarPreference}
      className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5"
    >
      <PanelHead icon={<Globe2 />} title={t("settings.language.nav")} />
      <p className="mb-3 text-[11px] leading-6 text-[var(--text-muted)]">{t("settings.language.description")}</p>
      <strong className="mb-2 block text-[11px] text-[var(--text)]">{t("settings.language.title")}</strong>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t("settings.language.title")}>
        {languageChoices.map((choice) => {
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
              <ChoiceMark active={active} kind="language" />
              <span className="min-w-0">
                <strong className="block text-sm text-[var(--text)]">{t(choice.labelKey)}</strong>
                <span className="mt-1 block text-[10px] leading-5 text-[var(--text-muted)]">{t(choice.detailKey)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="my-5 border-t border-[var(--dashboard-border)]" />
      <div className="mb-3 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
          <CalendarDays aria-hidden="true" className="size-4.5" />
        </span>
        <div>
          <strong className="block text-sm text-[var(--text)]">{t("settings.calendar.title")}</strong>
          <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">{t("settings.calendar.description")}</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3" role="radiogroup" aria-label={t("settings.calendar.title")}>
        {calendarChoices.map((choice) => {
          const active = choice.preference === calendarPreference;
          return (
            <button
              key={choice.preference}
              type="button"
              role="radio"
              aria-checked={active}
              data-calendar-choice={choice.preference}
              onClick={() => setCalendarPreference(choice.preference)}
              className={cn(
                "flex min-h-[86px] items-center gap-3 rounded-[16px] border bg-[var(--surface-2)] p-3 text-start transition-colors",
                "hover:border-[color-mix(in_srgb,var(--accent)_38%,var(--border))] hover:bg-[var(--accent-soft)]",
                active
                  ? "border-[color-mix(in_srgb,var(--accent)_52%,var(--border))] bg-[var(--accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
                  : "border-[var(--dashboard-border)]",
              )}
            >
              <ChoiceMark active={active} kind="calendar" />
              <span className="min-w-0">
                <strong className="block text-[12px] text-[var(--text)]">{t(choice.labelKey)}</strong>
                <span className="mt-1 block text-[9px] leading-5 text-[var(--text-muted)]">{t(choice.detailKey)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-1.5 rounded-[14px] bg-[var(--surface-2)] px-3 py-2 text-[10px] leading-5 text-[var(--text-muted)] sm:grid-cols-[1fr_auto] sm:items-center sm:gap-x-4">
        <span>{t("settings.calendar.persist")}</span>
        <div className="flex flex-wrap gap-x-3 gap-y-1 sm:justify-end">
          <strong data-active-locale className="text-[var(--accent-strong)]">{t("settings.language.current", { language: activeLanguage })}</strong>
          <strong data-active-calendar className="text-[var(--accent-strong)]">{t("settings.calendar.current", { calendar: activeCalendar })}</strong>
        </div>
      </div>
    </section>
  );
}
