"use client";

import { CalendarDays, Database, Info, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";

const items = [
  { id: "settings-data", label: "داده و پشتیبان", icon: Database },
  { id: "settings-general", label: "عمومی", icon: UserRound },
  { id: "settings-work", label: "برنامه کاری", icon: CalendarDays },
  { id: "settings-about", label: "درباره برنامه", icon: Info },
] as const;

type SettingsSectionId = (typeof items)[number]["id"];

function isSettingsSectionId(value: string): value is SettingsSectionId {
  return items.some((item) => item.id === value);
}

function getInitialSection(): SettingsSectionId {
  if (typeof window === "undefined") return items[0].id;
  const hash = window.location.hash.slice(1);
  return isSettingsSectionId(hash) ? hash : items[0].id;
}

export function SettingsNav() {
  const [active, setActive] = useState<SettingsSectionId>(getInitialSection);
  const { requestNavigation } = useUnsavedNavigation();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!isSettingsSectionId(hash)) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
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
