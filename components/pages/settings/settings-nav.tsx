"use client";

import { CalendarDays, Database, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";

const items = [
  { id: "settings-general", label: "عمومی و ظاهر", icon: UserRound },
  { id: "settings-data", label: "داده و پشتیبان", icon: Database },
  { id: "settings-work", label: "برنامه کاری و حقوق", icon: CalendarDays },
  { id: "settings-about", label: "ایمنی", icon: ShieldCheck },
] as const;

type SettingsSectionId = (typeof items)[number]["id"];

function isSettingsSectionId(value: string): value is SettingsSectionId {
  return items.some((item) => item.id === value);
}


const anchorParents: Record<string, SettingsSectionId> = {
  "settings-profile": "settings-general",
  "settings-appearance": "settings-general",
  "settings-behavior": "settings-general",
  "settings-health": "settings-data",
  "settings-recycle": "settings-data",
  "settings-storage": "settings-data",
  "settings-recovery": "settings-data",
  "settings-backup": "settings-data",
  "settings-restore": "settings-data",
  "settings-device-transfer": "settings-data",
  "settings-work-schedule": "settings-work",
  "settings-holidays": "settings-work",
  "settings-payroll": "settings-work",
  "settings-payroll-components": "settings-work",
  "settings-notifications": "settings-work",
  "settings-danger": "settings-about",
};

function resolveSettingsSection(value: string): SettingsSectionId | null {
  if (isSettingsSectionId(value)) return value;
  return anchorParents[value] ?? null;
}

function getInitialSection(): SettingsSectionId {
  if (typeof window === "undefined") return items[0].id;
  const hash = window.location.hash.slice(1);
  return resolveSettingsSection(hash) ?? items[0].id;
}

export function SettingsNav() {
  const [active, setActive] = useState<SettingsSectionId>(getInitialSection);
  const { requestNavigation } = useUnsavedNavigation();

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      const section = resolveSettingsSection(hash);
      if (!section) return;
      setActive(section);
    };
    const frame = requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1);
      if (resolveSettingsSection(hash)) document.getElementById(hash)?.scrollIntoView({ block: "start" });
    });
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  const navigateTo = (id: SettingsSectionId) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <>
    <aside className="dashboard-card sticky top-[84px] self-start rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-2.5 shadow-[0_6px_20px_rgba(0,0,0,.035)] max-[900px]:static max-[900px]:flex max-[900px]:overflow-x-auto">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-current={active === id ? "location" : undefined}
          onClick={() => requestNavigation(() => navigateTo(id))}
          className={cn(
            "group relative flex min-h-11 w-full items-center gap-3 rounded-[12px] px-3 text-right text-[12px] font-bold text-[var(--text)] transition-colors max-[900px]:min-w-max",
            "hover:bg-[var(--accent-soft)]",
            active === id && "bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[inset_-3px_0_0_var(--accent)] max-[900px]:shadow-[inset_0_-3px_0_var(--accent)]",
          )}
        >
          <Icon aria-hidden="true" />
          {label}
        </button>
      ))}
    </aside>
  </>;
}
