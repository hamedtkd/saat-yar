"use client";

import { Settings } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { LanguageSwitcher } from "../language-switcher";
import type { Mode } from "@/lib/types";
import { getTodayHref } from "@/lib/navigation";
import { getVisibleNavItems } from "../app-header/nav-items";
import { GuardedLink } from "./guarded-link";

type Props = { mode: Mode; currentPath: string; name: string };

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

export function SidebarNav({ mode, currentPath, name }: Props) {
  const { t } = useLocale();
  const items = getVisibleNavItems(mode);
  const normalizedPath = normalizePath(currentPath);
  const settingsActive = normalizedPath === "/settings" || normalizedPath.startsWith("/settings/");
  const subtitle = name ? t("app.personalSpace", { name }) : t("app.brandSubtitle");
  return (
    <aside className="fixed inset-y-2 start-2 z-40 hidden w-[var(--shell-sidebar-width)] flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[linear-gradient(180deg,var(--surface-1),var(--surface-raised))] p-3 shadow-[0_10px_32px_rgba(0,0,0,.055)] xl:flex dark:shadow-[0_14px_38px_rgba(0,0,0,.24)]">
      <div className="border-b border-[var(--dashboard-border)] px-2 pb-4 pt-2">
        <GuardedLink
          href={getTodayHref(mode)}
          aria-label={t("nav.goToday")}
          className="inline-flex rounded-[14px] outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          <Brand subtitle={subtitle} />
        </GuardedLink>
      </div>

      <p className="mb-2 mt-4 px-3 text-[9px] font-black tracking-[.08em] text-[var(--text-muted)]">{t("nav.main")}</p>
      <nav aria-label={t("nav.primaryAria")} className="grid gap-1.5">
        {items.map(({ href, labelKey, icon: Icon }) => {
          const active = normalizedPath === href;
          return (
            <GuardedLink
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-[var(--control-radius)] px-3 text-sm font-bold text-[var(--text-muted)] transition",
                "hover:bg-[var(--accent-soft)] hover:text-[var(--text)]",
                active && "bg-[var(--accent-fill)] text-[var(--accent-foreground)] shadow-[0_7px_18px_color-mix(in_srgb,var(--accent)_18%,transparent)] hover:bg-[var(--accent-fill)] hover:text-[var(--accent-foreground)]",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-[10px] bg-[var(--surface-2)] transition-colors group-hover:bg-[var(--surface-1)]",
                  active && "bg-[color-mix(in_srgb,var(--accent-foreground)_12%,transparent)] text-[var(--accent-foreground)] group-hover:bg-[color-mix(in_srgb,var(--accent-foreground)_12%,transparent)]",
                )}
              >
                <Icon aria-hidden="true" />
              </span>
              <span>{t(labelKey)}</span>
              {active && <span aria-hidden="true" className="ms-auto size-1.5 rounded-full bg-[var(--accent-foreground)]/70" />}
            </GuardedLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[var(--dashboard-border)] pt-3">
        <div className="mb-1.5">
          <LanguageSwitcher variant="sidebar" />
        </div>
        <GuardedLink
          href="/settings"
          aria-current={settingsActive ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-[var(--control-radius)] px-3 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]",
            settingsActive && "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
          )}
        >
          <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--surface-2)]">
            <Settings aria-hidden="true" />
          </span>
          {t("nav.settings")}
        </GuardedLink>
        <div className="mt-3 rounded-[16px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-3 text-[10px] text-[var(--text-muted)]">
          <div className="flex items-center gap-2 font-black text-[var(--text)]">
            <span className="size-2 rounded-full bg-[var(--success)] shadow-[0_0_0_4px_var(--success-soft)]" />
            {t("app.ready")}
          </div>
          <p className="mt-1.5 leading-5">{t("app.localStorageReady")}</p>
        </div>
      </div>
    </aside>
  );
}
