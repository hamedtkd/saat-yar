"use client";

import { MoreHorizontal, Settings, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";
import { getMobilePrimaryNavItems, getVisibleNavItems } from "../app-header/nav-items";
import { GuardedLink } from "./guarded-link";

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

const mobileNavCell = "flex min-h-[54px] items-center justify-center rounded-[16px] text-[10px] font-bold text-[var(--text-muted)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]";
const mobileNavCapsule = "flex min-w-[54px] flex-col items-center justify-center gap-0.5 rounded-[13px] px-2 py-1.5 transition-[background-color,color,box-shadow]";

export function MobileBottomNav({ mode, currentPath }: { mode: Mode; currentPath: string }) {
  const [open, setOpen] = useState(false);
  const normalizedPath = normalizePath(currentPath);
  const visible = getVisibleNavItems(mode);
  const primary = getMobilePrimaryNavItems(mode);
  const primaryHrefs = new Set(primary.map((item) => item.href));
  const overflow = visible.filter((item) => !primaryHrefs.has(item.href));
  const overflowActive = normalizedPath === "/settings" || overflow.some((item) => item.href === normalizedPath);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm xl:hidden" onClick={() => setOpen(false)}>
          <section
            id="mobile-more-menu"
            aria-label="سایر بخش‌ها"
            className="absolute bottom-[calc(82px+env(safe-area-inset-bottom))] left-1/2 w-[calc(100%-16px)] max-w-[520px] -translate-x-1/2 rounded-[24px] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] p-3 shadow-[0_18px_48px_rgba(0,0,0,.24)] backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-[var(--border)]" />
            <div className="mb-2 flex items-center justify-between px-1">
              <div>
                <strong className="text-sm">سایر بخش‌ها</strong>
                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">دسترسی سریع به ابزارهای دیگر ساعت‌یار</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="بستن منو" className="grid size-10 place-items-center rounded-xl hover:bg-[var(--accent-soft)]">
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {overflow.map(({ href, label, icon: Icon }) => {
                const active = normalizedPath === href;
                return (
                  <GuardedLink
                    key={href}
                    href={href}
                    onNavigate={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-2xl bg-[var(--surface-2)] px-3 text-sm font-bold text-[var(--text)]",
                      active && "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5 text-[var(--accent-strong)]" />
                    {label}
                  </GuardedLink>
                );
              })}
              <GuardedLink
                href="/settings"
                onNavigate={() => setOpen(false)}
                aria-current={normalizedPath === "/settings" ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-2xl bg-[var(--surface-2)] px-3 text-sm font-bold text-[var(--text)]",
                  normalizedPath === "/settings" && "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
                )}
              >
                <Settings aria-hidden="true" className="size-5 text-[var(--accent-strong)]" />
                تنظیمات
              </GuardedLink>
            </div>
          </section>
        </div>
      )}

      <nav
        aria-label="ناوبری موبایل"
        className="fixed bottom-[calc(8px+env(safe-area-inset-bottom))] left-1/2 z-50 grid w-[calc(100%-16px)] max-w-[520px] -translate-x-1/2 grid-cols-5 rounded-[21px] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] p-1 shadow-[0_10px_30px_rgba(0,0,0,.16)] backdrop-blur-2xl xl:hidden"
      >
        {primary.map(({ href, label, icon: Icon }) => {
          const active = normalizedPath === href;
          return (
            <GuardedLink key={href} href={href} aria-current={active ? "page" : undefined} className={mobileNavCell}>
              <span
                className={cn(
                  mobileNavCapsule,
                  active && "bg-[var(--accent-soft)] text-[var(--accent-strong)] ring-1 ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]",
                )}
              >
                <Icon aria-hidden="true" className="size-[19px]" />
                <span className="leading-4">{label}</span>
              </span>
            </GuardedLink>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-more-menu"
          className={mobileNavCell}
        >
          <span
            className={cn(
              mobileNavCapsule,
              (open || overflowActive) && "bg-[var(--accent-soft)] text-[var(--accent-strong)] ring-1 ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]",
            )}
          >
            <MoreHorizontal aria-hidden="true" className="size-[19px]" />
            <span className="leading-4">بیشتر</span>
          </span>
        </button>
      </nav>
    </>
  );
}
