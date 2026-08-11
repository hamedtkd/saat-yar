"use client";

import { ArrowLeft, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { settingsNavGroups, settingsNavItems } from "./settings-navigation-model";

export function SettingsSearch() {
  const { locale, direction, t } = useLocale();
  const [query, setQuery] = useState("");
  const { requestNavigation } = useUnsavedNavigation();
  const normalized = query.trim().toLocaleLowerCase(locale === "en" ? "en-US" : "fa-IR");
  const results = useMemo(() => {
    if (!normalized) return [];
    return settingsNavItems
      .filter((item) => {
        const translatedGroup = settingsNavGroups.find((group) => group.id === item.groupId);
        const haystack = [t(item.labelKey), translatedGroup ? t(translatedGroup.labelKey) : "", item.keywords]
          .join(" ")
          .toLocaleLowerCase(locale === "en" ? "en-US" : "fa-IR");
        return haystack.includes(normalized);
      })
      .slice(0, 7);
  }, [locale, normalized, t]);

  const goTo = (section: string) => {
    requestNavigation(() => {
      window.history.replaceState(null, "", `#${section}`);
      window.dispatchEvent(new Event("hashchange"));
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setQuery("");
    });
  };

  const quickItems = [
    { label: t("settings.search.payroll"), query: t("settings.search.payroll") },
    { label: "QR", query: "QR" },
    { label: t("settings.search.appearance"), query: t("settings.search.appearance") },
    { label: t("settings.search.backup"), query: t("settings.search.backup") },
  ];

  return (
    <section className="dashboard-card relative z-40 mb-5 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-3 shadow-[0_5px_16px_rgba(0,0,0,.025)] sm:p-4">
      <div className="flex items-center gap-3 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
        <Search aria-hidden="true" className="size-4.5 shrink-0 text-[var(--accent-strong)]" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("settings.search.placeholder")}
          aria-label={t("settings.search.aria")}
          className="h-11 min-w-0 flex-1 bg-transparent text-xs font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
        />
        {query && (
          <button type="button" aria-label={t("settings.search.clear")} onClick={() => setQuery("")} className="grid size-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]">
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>

      {normalized && (
        <div className="absolute start-3 end-3 top-[calc(100%-6px)] z-50 rounded-[16px] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] p-2 shadow-[0_18px_48px_rgba(0,0,0,.16)] backdrop-blur-2xl sm:start-4 sm:end-4">
          {results.length > 0 ? (
            <div className="grid gap-1">
              {results.map((item) => {
                const group = settingsNavGroups.find((candidate) => candidate.id === item.groupId);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(item.id)}
                    className="group flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-start transition-colors hover:bg-[var(--accent-soft)]"
                  >
                    <span className="grid gap-0.5">
                      <strong className="text-[11px] text-[var(--text)] group-hover:text-[var(--accent-strong)]">{t(item.labelKey)}</strong>
                      <small className="text-[9px] font-semibold text-[var(--text-muted)]">{group ? t(group.labelKey) : ""}</small>
                    </span>
                    <ArrowLeft aria-hidden="true" className={cn("size-4 text-[var(--text-muted)] group-hover:text-[var(--accent-strong)]", direction === "ltr" && "rotate-180")} />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-4 text-center text-[11px] font-semibold text-[var(--text-muted)]">{t("settings.search.empty")}</p>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1 text-[9px] text-[var(--text-muted)]">
        <span>{t("settings.search.quick")}</span>
        {quickItems.map((item) => (
          <button key={item.label} type="button" onClick={() => setQuery(item.query)} className={cn("rounded-full bg-[var(--surface-2)] px-2 py-1 font-bold hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]")}>{item.label}</button>
        ))}
      </div>
    </section>
  );
}
