"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { resolveSettingsNavItem, settingsNavGroups, settingsNavItems } from "./settings-navigation-model";

type SettingsItemId = (typeof settingsNavItems)[number]["id"];

function getVisibleSettingsItem(): SettingsItemId {
  if (typeof window === "undefined") return settingsNavItems[0].id;
  const threshold = Math.min(176, Math.max(108, window.innerHeight * 0.2));
  const hashItem = resolveSettingsNavItem(window.location.hash.slice(1));
  if (hashItem) {
    const hashElement = document.getElementById(hashItem);
    const hashRect = hashElement?.getBoundingClientRect();
    if (hashRect && hashRect.top <= window.innerHeight * 0.7 && hashRect.bottom >= threshold) {
      return hashItem as SettingsItemId;
    }
  }

  let nearestAbove: { id: SettingsItemId; distance: number } | null = null;
  let nearestBelow: { id: SettingsItemId; distance: number } | null = null;

  for (const item of settingsNavItems) {
    const element = document.getElementById(item.id);
    if (!element) continue;
    const distance = element.getBoundingClientRect().top - threshold;
    if (distance <= 0 && (!nearestAbove || distance > nearestAbove.distance)) {
      nearestAbove = { id: item.id as SettingsItemId, distance };
    } else if (distance > 0 && (!nearestBelow || distance < nearestBelow.distance)) {
      nearestBelow = { id: item.id as SettingsItemId, distance };
    }
  }

  return nearestAbove?.id ?? nearestBelow?.id ?? (hashItem as SettingsItemId | null) ?? settingsNavItems[0].id;
}

function subscribeToSettingsPosition(onStoreChange: () => void) {
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(onStoreChange);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("hashchange", schedule);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("hashchange", schedule);
  };
}

function replaceSettingsHash(id: SettingsItemId) {
  const previousUrl = window.location.href;
  window.history.replaceState(null, "", `#${id}`);
  window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: previousUrl, newURL: window.location.href }));
}

export function SettingsNav() {
  const active = useSyncExternalStore(subscribeToSettingsPosition, getVisibleSettingsItem, () => settingsNavItems[0].id);
  const { requestNavigation } = useUnsavedNavigation();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1);
      const target = resolveSettingsNavItem(hash) ? hash : "";
      if (target) document.getElementById(target)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-settings-nav-id="${active}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const navigateTo = (id: SettingsItemId) => {
    replaceSettingsHash(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside
      aria-label="بخش‌های تنظیمات"
      className={cn(
        "dashboard-card sticky top-[84px] max-h-[calc(100dvh-104px)] self-start overflow-y-auto rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-2.5 shadow-[0_6px_20px_rgba(0,0,0,.035)]",
        "max-[900px]:top-[72px] max-[900px]:z-20 max-[900px]:flex max-[900px]:max-h-none max-[900px]:gap-1.5 max-[900px]:overflow-x-auto max-[900px]:overflow-y-hidden max-[900px]:p-1.5",
      )}
    >
      {settingsNavGroups.map((group) => {
        const groupItems = settingsNavItems.filter((item) => item.groupId === group.id);
        return (
          <div key={group.id} className="grid gap-1 max-[900px]:contents">
            <p className="mb-0.5 mt-2 px-2 text-[9px] font-black text-[var(--text-muted)] first:mt-0 max-[900px]:hidden">{group.label}</p>
            {groupItems.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  type="button"
                  data-settings-nav-id={id}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => requestNavigation(() => navigateTo(id as SettingsItemId))}
                  className={cn(
                    "group flex min-h-9 w-full items-center gap-2.5 rounded-[11px] px-2.5 text-right text-[11px] font-bold text-[var(--text-muted)] transition-colors",
                    "hover:bg-[var(--accent-soft)] hover:text-[var(--text)]",
                    "max-[900px]:min-h-10 max-[900px]:w-auto max-[900px]:min-w-max max-[900px]:shrink-0 max-[900px]:rounded-[13px] max-[900px]:px-3",
                    isActive && "bg-[var(--accent-soft)] text-[var(--accent-strong)] ring-1 ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span>{label}</span>
                  {isActive && <span aria-hidden="true" className="mr-auto size-1.5 rounded-full bg-[var(--accent)] max-[900px]:hidden" />}
                </button>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
}
