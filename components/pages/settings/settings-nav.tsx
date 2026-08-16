"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { cn } from "@/lib/cn";
import { SettingsMobileNav } from "./settings-mobile-nav";
import {
  getSettingsGroupId,
  getSettingsGroupItems,
  resolveSettingsNavItem,
  settingsNavGroups,
  settingsNavItems,
  type SettingsNavGroupId,
} from "./settings-navigation-model";

type SettingsItemId = (typeof settingsNavItems)[number]["id"];

function getVisibleSettingsItem(): SettingsItemId {
  if (typeof window === "undefined") return settingsNavItems[0].id as SettingsItemId;
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/settings";
  const threshold = Math.min(176, Math.max(108, window.innerHeight * 0.2));
  const hashItemId = resolveSettingsNavItem(window.location.hash.slice(1));
  const hashItem = settingsNavItems.find((item) => item.id === hashItemId && item.href === pathname);
  if (hashItem) {
    const rect = document.getElementById(hashItem.id)?.getBoundingClientRect();
    if (rect && rect.top <= window.innerHeight * 0.7 && rect.bottom >= threshold) return hashItem.id as SettingsItemId;
  }
  let nearestAbove: { id: SettingsItemId; distance: number } | null = null;
  let nearestBelow: { id: SettingsItemId; distance: number } | null = null;
  for (const item of settingsNavItems.filter((candidate) => candidate.href === pathname)) {
    const element = document.getElementById(item.id);
    if (!element) continue;
    const distance = element.getBoundingClientRect().top - threshold;
    if (distance <= 0 && (!nearestAbove || distance > nearestAbove.distance)) nearestAbove = { id: item.id as SettingsItemId, distance };
    else if (distance > 0 && (!nearestBelow || distance < nearestBelow.distance)) nearestBelow = { id: item.id as SettingsItemId, distance };
  }
  return nearestAbove?.id ?? nearestBelow?.id ?? (settingsNavItems.find((item) => item.href === pathname)?.id as SettingsItemId | undefined) ?? settingsNavItems[0].id as SettingsItemId;
}

function subscribeToSettingsPosition(onStoreChange: () => void) {
  let frame = 0;
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(onStoreChange); };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("hashchange", schedule);
  window.addEventListener("popstate", schedule);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("hashchange", schedule);
    window.removeEventListener("popstate", schedule);
  };
}

function replaceSettingsHash(id: SettingsItemId) {
  const previousUrl = window.location.href;
  window.history.replaceState(null, "", `#${id}`);
  window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: previousUrl, newURL: window.location.href }));
}

export function SettingsNav() {
  const pathname = usePathname() || "/settings";
  const router = useRouter();
  const { t } = useLocale();
  const { requestNavigation } = useUnsavedNavigation();
  const active = useSyncExternalStore(subscribeToSettingsPosition, getVisibleSettingsItem, () => settingsNavItems[0].id as SettingsItemId);
  const activeGroup = getSettingsGroupId(active);
  const [groupOverrides, setGroupOverrides] = useState<Partial<Record<SettingsNavGroupId, boolean>>>({});

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1);
      const target = settingsNavItems.find((item) => item.id === hash && item.href === pathname);
      if (target) document.getElementById(target.id)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const navigateTo = (id: SettingsItemId) => {
    const item = settingsNavItems.find((candidate) => candidate.id === id);
    if (!item) return;
    if (item.href === pathname) {
      replaceSettingsHash(id);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    router.push(`${item.href}#${item.id}`);
  };

  const toggleGroup = (groupId: SettingsNavGroupId) => {
    const defaultOpen = groupId === activeGroup;
    setGroupOverrides((current) => ({ ...current, [groupId]: !(current[groupId] ?? defaultOpen) }));
  };

  return <aside aria-label={t("settings.navAria")} className="sticky top-[84px] z-20 self-start max-[900px]:top-[72px]">
    <div className="dashboard-card max-h-[calc(100dvh-104px)] overflow-y-auto rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-2.5 shadow-[0_6px_20px_rgba(0,0,0,.035)] max-[900px]:hidden">
      {settingsNavGroups.map((group) => { const items = getSettingsGroupItems(group.id); const isActiveGroup = activeGroup === group.id; const isOpen = groupOverrides[group.id] ?? isActiveGroup; return <div key={group.id} className="border-b border-[var(--border)] py-1.5 last:border-b-0"><button type="button" data-settings-group-id={group.id} aria-expanded={isOpen} onClick={() => toggleGroup(group.id)} className={cn("flex min-h-10 w-full items-center gap-2 rounded-xl px-2.5 text-start transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]", isActiveGroup && "bg-[var(--accent-soft)] text-[var(--accent-strong)]")}><span className="min-w-0 flex-1"><strong className="block text-[10px] font-black">{t(group.labelKey)}</strong></span><span className="rounded-md bg-[var(--surface-raised)] px-1.5 py-0.5 text-[8px] font-black text-[var(--text-muted)]">{items.length}</span><ChevronDown aria-hidden className={cn("size-3.5 shrink-0 transition-transform", isOpen && "rotate-180")} /></button>{isOpen && <div className="mt-1 grid gap-0.5 ps-2">{items.map(({ id, labelKey, icon: Icon }) => { const isActive = active === id; return <button key={id} type="button" data-settings-nav-id={id} aria-current={isActive ? "location" : undefined} onClick={() => requestNavigation(() => navigateTo(id as SettingsItemId))} className={cn("group flex min-h-9 w-full items-center gap-2.5 rounded-[11px] px-2.5 text-start text-[10px] font-bold text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text)]", isActive && "bg-[var(--accent-soft)] text-[var(--accent-strong)] ring-1 ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]")}><Icon aria-hidden className="size-4 shrink-0" /><span className="truncate">{t(labelKey)}</span>{isActive && <span aria-hidden className="ms-auto size-1.5 rounded-full bg-[var(--accent)]" />}</button>; })}</div>}</div>; })}
    </div>
    <SettingsMobileNav active={active} activeGroup={activeGroup} onNavigate={navigateTo} />
  </aside>;
}
