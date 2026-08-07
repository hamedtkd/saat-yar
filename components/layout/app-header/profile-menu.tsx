"use client";

import {
  ChevronDown,
  DatabaseBackup,
  Download,
  Palette,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";
import { headerControlShell } from "./header-control-styles";

const modeLabels: Record<Mode, string> = {
  employee: "کارمند",
  freelancer: "فریلنسر",
  hybrid: "ترکیبی",
};

const menuItems = [
  { label: "پروفایل و نام نمایشی", hash: "settings-profile", icon: UserRound },
  { label: "ظاهر و تم", hash: "settings-appearance", icon: Palette },
  { label: "انتقال بین دستگاه‌ها", hash: "settings-device-transfer", icon: Smartphone },
  { label: "پشتیبان و بازیابی", hash: "settings-backup", icon: DatabaseBackup },
  { label: "سلامت داده", hash: "settings-health", icon: ShieldCheck },
] as const;

function ProfileAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const initial = name.slice(0, 1);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_28%,var(--dashboard-border))]",
        "bg-[linear-gradient(145deg,var(--accent-soft),var(--surface-accent))] font-black text-[var(--accent-strong)]",
        size === "lg" ? "size-11 text-base" : "size-8 text-xs",
      )}
    >
      {initial}
      <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--surface-1)] bg-[var(--success)]" />
    </span>
  );
}

export function ProfileMenu({
  name,
  mode,
  onNavigate,
  onExport,
}: {
  name: string;
  mode: Mode;
  onNavigate: (hash: string) => void;
  onExport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const displayName = name.trim() || "کاربر ساعت‌یار";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const navigate = (hash: string) => {
    setOpen(false);
    onNavigate(hash);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`پروفایل ${displayName}`}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          headerControlShell,
          "flex min-w-[158px] items-center gap-2 px-2 text-right",
          "max-[520px]:w-11 max-[520px]:min-w-11 max-[520px]:justify-center max-[520px]:px-1.5",
          open && "border-[color-mix(in_srgb,var(--accent)_38%,var(--dashboard-border))] bg-[var(--accent-soft)]",
        )}
      >
        <ProfileAvatar name={displayName} />
        <span className="min-w-0 flex-1 leading-tight max-[520px]:hidden">
          <strong className="block truncate text-[11px] text-[var(--text)]">{displayName}</strong>
          <span className="text-[9px] font-semibold text-[var(--text-muted)]">پروفایل محلی</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0 text-[var(--text-muted)] transition-transform max-[520px]:hidden",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="منوی پروفایل"
          className="absolute left-0 top-[calc(100%+8px)] z-[1100] w-[300px] overflow-hidden rounded-[18px] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] p-2 shadow-[0_18px_48px_rgba(0,0,0,.18)] backdrop-blur-2xl max-[420px]:fixed max-[420px]:left-2 max-[420px]:right-2 max-[420px]:top-[72px] max-[420px]:w-auto"
        >
          <div className="mb-1.5 rounded-[14px] bg-[var(--surface-2)] px-3 py-3">
            <div className="flex items-center gap-3">
              <ProfileAvatar name={displayName} size="lg" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-[var(--text)]">{displayName}</strong>
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">پروفایل محلی · {modeLabels[mode]}</span>
              </div>
              <span className="rounded-full bg-[var(--success-soft)] px-2 py-1 text-[9px] font-black text-[var(--success)]">محلی</span>
            </div>
            <p className="mt-2 text-[9px] leading-5 text-[var(--text-muted)]">اطلاعات این پروفایل روی همین دستگاه نگه‌داری می‌شود و فقط با انتقال یا پشتیبان جابه‌جا می‌شود.</p>
          </div>

          <div className="grid gap-0.5">
            {menuItems.map(({ label, hash, icon: Icon }) => (
              <button
                key={`${label}-${hash}`}
                type="button"
                role="menuitem"
                onClick={() => navigate(hash)}
                className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-right text-[11px] font-bold text-[var(--text)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
              >
                <span className="grid size-7 place-items-center rounded-[9px] bg-[var(--surface-2)] text-[var(--accent-strong)]"><Icon aria-hidden="true" className="size-4" /></span>
                {label}
              </button>
            ))}
          </div>

          <div className="mt-1.5 border-t border-[var(--dashboard-border)] pt-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onExport(); }}
              className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-right text-[11px] font-bold text-[var(--text)] transition-colors hover:bg-[var(--accent-soft)]"
            >
              <span className="grid size-7 place-items-center rounded-[9px] bg-[var(--surface-2)] text-[var(--accent-strong)]"><Download aria-hidden="true" className="size-4" /></span>
              دانلود پشتیبان فوری
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
