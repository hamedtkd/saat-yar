"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { headerStandaloneIconButton } from "./app-header/header-control-styles";

type Variant = "compact" | "sidebar";

type Choice = {
  locale: Locale;
  code: "FA" | "EN";
  labelKey: "settings.language.persian" | "settings.language.english";
};

const choices: readonly Choice[] = [
  { locale: "fa-IR", code: "FA", labelKey: "settings.language.persian" },
  { locale: "en", code: "EN", labelKey: "settings.language.english" },
];

function LanguageFlag({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-[18px] w-[26px] shrink-0 overflow-hidden rounded-[5px] ring-1 ring-inset ring-[var(--border)]",
        className,
      )}
    >
      {locale === "fa-IR" ? (
        <svg viewBox="0 0 26 18" className="h-full w-full" role="presentation">
          <rect width="26" height="6" y="0" fill="#239f40" />
          <rect width="26" height="6" y="6" fill="#fff" />
          <rect width="26" height="6" y="12" fill="#da0000" />
        </svg>
      ) : (
        <svg viewBox="0 0 26 18" className="h-full w-full" role="presentation">
          <rect width="26" height="18" fill="#21468b" />
          <path d="M0 0 26 18M26 0 0 18" stroke="#fff" strokeWidth="4.8" />
          <path d="M0 0 26 18M26 0 0 18" stroke="#cf142b" strokeWidth="2.1" />
          <path d="M13 0v18M0 9h26" stroke="#fff" strokeWidth="5.4" />
          <path d="M13 0v18M0 9h26" stroke="#cf142b" strokeWidth="2.8" />
        </svg>
      )}
    </span>
  );
}

export function LanguageSwitcher({ variant, className }: { variant: Variant; className?: string }) {
  const { locale, setLocale, t } = useLocale();
  const currentLabel = locale === "en" ? t("settings.language.english") : t("settings.language.persian");
  const compact = variant === "compact";

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger
        data-language-switch-trigger={variant}
        aria-label={t("header.language")}
        title={t("header.languageCurrent", { language: currentLabel })}
        className={cn(
          compact
            ? cn(
                headerStandaloneIconButton,
                "justify-center gap-0 pe-0 ps-0 [&>svg]:hidden",
              )
            : [
                "h-11 w-full justify-start gap-2.5 rounded-[var(--control-radius)] border-[var(--dashboard-border)] bg-[var(--surface-2)] py-0 ps-2.5 pe-9",
                "hover:bg-[var(--accent-soft)] [&>svg]:end-2.5",
              ],
          className,
        )}
      >
        <LanguageFlag locale={locale} className={compact ? "h-[17px] w-6" : undefined} />
        {!compact && (
          <span className="min-w-0 flex-1 text-start leading-tight">
            <strong className="block truncate text-[10px] font-black text-[var(--text)]">{t("settings.language.nav")}</strong>
            <span className="mt-0.5 block truncate text-[9px] font-semibold text-[var(--text-muted)]">{currentLabel}</span>
          </span>
        )}
      </SelectTrigger>

      <SelectContent align={compact ? "end" : "start"} className="w-auto min-w-[190px]">
        {choices.map((choice) => (
          <SelectItem key={choice.locale} value={choice.locale} data-quick-locale-choice={choice.locale}>
            <span className="flex min-w-[128px] items-center gap-2.5">
              <LanguageFlag locale={choice.locale} />
              <span className="min-w-0 flex-1 font-bold">{t(choice.labelKey)}</span>
              <span className="text-[9px] font-black tracking-[.08em] text-[var(--text-muted)]">{choice.code}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
