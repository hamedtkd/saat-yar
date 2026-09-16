"use client";

import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Grid3X3,
  Play,
  Settings2,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/common/progress-bar";
import { cn } from "@/lib/cn";
import { createAppearancePreviewTokens } from "@/lib/appearance-settings";
import type { AppearanceSettings } from "@/lib/types";

const darkQuery = "(prefers-color-scheme: dark)";
function subscribeToSystemTheme(callback: () => void) { const media = window.matchMedia(darkQuery); media.addEventListener("change", callback); return () => media.removeEventListener("change", callback); }
function getSystemDarkSnapshot() { return window.matchMedia(darkQuery).matches; }
function getServerDarkSnapshot() { return false; }

const navItems = [
  { icon: Grid3X3, label: "Today" },
  { icon: CalendarDays, label: "Work calendar" },
  { icon: BriefcaseBusiness, label: "Projects" },
  { icon: BarChart3, label: "Reports" },
] as const;

export function ThemePreview({ appearance }: { appearance: AppearanceSettings }) {
  const { digits, duration, locale, money, percent, s } = useSystemUi();
  const systemDark = useSyncExternalStore(subscribeToSystemTheme, getSystemDarkSnapshot, getServerDarkSnapshot);
  const resolvedMode = appearance.mode === "system" ? (systemDark ? "dark" : "light") : appearance.mode;
  const language = locale.startsWith("fa") ? "fa" : "en";
  const direction = language === "fa" ? "rtl" : "ltr";
  const style = createAppearancePreviewTokens(appearance, resolvedMode, language) as CSSProperties;

  return (
    <div
      data-appearance-preview-surface
      data-sidebar-style={appearance.sidebarStyle}
      data-sidebar-accent={appearance.sidebarAccent}
      data-sidebar-width={appearance.sidebarWidth}
      dir={direction}
      style={{ ...style, fontFamily: "var(--app-body-font)" }}
      className="min-h-[620px] overflow-hidden rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--page)] text-[var(--text)] shadow-[var(--surface-shadow)]"
    >
      <div className="grid min-h-[620px] grid-cols-[var(--preview-sidebar-width)_minmax(0,1fr)] max-[760px]:grid-cols-1">
        <aside className="border-e border-[var(--sidebar-border)] bg-[var(--sidebar-background)] p-[calc(.7rem*var(--density-space))] max-[760px]:hidden">
          <div className="flex h-full flex-col">
            <div className="mb-5 flex items-center gap-2 px-2 py-1">
              <span className="grid size-8 place-items-center rounded-[var(--control-radius)] bg-[var(--accent-fill)] text-[var(--accent-foreground)]"><Clock3 className="size-4" /></span>
              <strong className="text-[11px]" style={{ fontFamily: "var(--app-heading-font)" }}>{s("Saatyar")}</strong>
            </div>
            <nav className="grid gap-1">
              {navItems.map(({ icon: Icon, label }, index) => (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    "flex min-h-[var(--control-height-sm)] items-center gap-2 rounded-[var(--control-radius)] px-2.5 text-start text-[10px] font-bold transition-colors",
                    index === 0 ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-fg)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{s(label)}</span>
                </button>
              ))}
            </nav>
            <button type="button" className="mt-auto flex min-h-[var(--control-height-sm)] items-center gap-2 rounded-[var(--control-radius)] px-2.5 text-start text-[10px] font-bold text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
              <Settings2 className="size-3.5" />
              <span>{s("Settings")}</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 bg-[var(--page)]">
          <header className="flex min-h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-1)] px-[calc(1rem*var(--density-space))]">
            <div>
              <small className="text-[9px] font-bold text-[var(--text-muted)]">{s("Today")}</small>
              <strong className="mt-0.5 block text-[13px]" style={{ fontFamily: "var(--app-heading-font)" }}>{s("Draft preview")}</strong>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden w-44 sm:block"><Input aria-label={s("Preview input")} placeholder={s("Preview input")} /></div>
              <button type="button" aria-label="Notifications" className="grid size-9 place-items-center rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)]"><Bell className="size-4" /></button>
              <span className="grid size-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)]"><UserRound className="size-4" /></span>
            </div>
          </header>

          <div className="grid gap-[calc(.85rem*var(--density-space))] p-[calc(1rem*var(--density-space))]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <small className="text-[9px] font-bold text-[var(--text-muted)]">{s("Today")}</small>
                <h3 className="m-0 mt-1 text-[clamp(18px,2vw,28px)] font-black" style={{ fontFamily: "var(--app-heading-font)" }}>{s("Workday")}</h3>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">{s("Cards, controls, and accent color")}</p>
              </div>
              <Button size="sm"><Play /> {s("Start")}</Button>
            </div>

            <div className="grid gap-[calc(.65rem*var(--density-space))] sm:grid-cols-3">
              <article className="rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] p-[calc(.8rem*var(--density-space))] shadow-[var(--surface-shadow)]">
                <div className="flex items-center justify-between gap-2"><small className="text-[9px] font-bold text-[var(--text-muted)]">{s("Today's pay")}</small><WalletCards className="size-4 text-[var(--accent-strong)]" /></div>
                <strong className="mt-3 block text-lg" style={{ fontFamily: "var(--app-heading-font)" }}>{money(483168)}</strong>
                <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-[var(--success)]"><CheckCircle2 className="size-3" /> +{percent(12)}</span>
              </article>
              <article className="rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] p-[calc(.8rem*var(--density-space))] shadow-[var(--surface-shadow)]">
                <small className="text-[9px] font-bold text-[var(--text-muted)]">{s("Day progress")}</small>
                <strong className="mt-3 block text-lg" style={{ fontFamily: "var(--app-heading-font)" }}>{percent(48)}</strong>
                <ProgressBar className="mt-3" value={48} />
              </article>
              <article className="rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-[calc(.8rem*var(--density-space))] shadow-[var(--surface-shadow)]">
                <small className="text-[9px] font-bold text-[var(--text-muted)]">{s("Workday")}</small>
                <strong className="mt-3 block text-lg" style={{ fontFamily: "var(--app-heading-font)" }}>{duration(380)}</strong>
                <p className="mt-2 text-[9px] text-[var(--text-muted)]">{duration(70)} {s("remaining")}</p>
              </article>
            </div>

            <section className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] shadow-[var(--surface-shadow)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-[calc(.8rem*var(--density-space))] py-[calc(.65rem*var(--density-space))]">
                <div><strong className="block text-[11px]" style={{ fontFamily: "var(--app-heading-font)" }}>{s("Projects")}</strong><small className="text-[9px] text-[var(--text-muted)]">{s("Recent work")}</small></div>
                <Button size="sm" variant="outline">{s("Secondary")}</Button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {(["Design report page", "Planning meeting", "Review new version"] as const).map((title, index) => (
                  <div key={title} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-[calc(.8rem*var(--density-space))] py-[calc(.65rem*var(--density-space))] text-[10px]">
                    <div className="min-w-0"><strong className="block truncate">{s(title)}</strong><small className="text-[var(--text-muted)]">PRJ-{digits(184 - index * 5)}</small></div>
                    <span className="text-[var(--text-muted)]">{duration(index === 0 ? 130 : index === 1 ? 90 : 45)}</span>
                    <span className={cn("rounded-[var(--control-radius-sm)] px-2 py-1 text-[8px] font-bold", index === 1 ? "bg-[var(--warning-soft)] text-[var(--warning)]" : "bg-[var(--success-soft)] text-[var(--success)]")}>{s(index === 1 ? "Pending" : "Active")}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
