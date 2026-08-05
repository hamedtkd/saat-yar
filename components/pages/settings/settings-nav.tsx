"use client";

import { CalendarDays, Database, Info, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

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

export function SettingsNav() {
  const [active, setActive] = useState<SettingsSectionId>(items[0].id);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!isSettingsSectionId(hash)) return;
    setActive(hash);
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    });
  }, []);

  const goTo = (id: SettingsSectionId) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="self-start rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] p-2 shadow-[0_6px_20px_rgba(17,45,55,.04)] max-[900px]:flex max-[900px]:overflow-x-auto">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-current={active === id ? "location" : undefined}
          onClick={() => goTo(id)}
          className={cn(
            "flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-right text-sm font-semibold text-[var(--text)] transition-colors max-[900px]:min-w-max",
            "hover:bg-[var(--accent-soft)]",
            active === id && "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
          )}
        >
          <Icon aria-hidden="true" />
          {label}
        </button>
      ))}
    </aside>
  );
}
