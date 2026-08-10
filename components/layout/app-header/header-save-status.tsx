"use client";

import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/components/i18n/locale-provider";

type SaveState = "idle" | "saving" | "saved" | "error";

export function HeaderSaveStatus({ state }: { state: SaveState }) {
  const { t } = useLocale();
  if (state === "idle") return null;

  const saving = state === "saving";
  const error = state === "error";
  const Icon = saving ? LoaderCircle : error ? AlertCircle : CheckCircle2;
  const label = saving ? t("header.save.saving") : error ? t("header.save.error") : t("header.save.saved");

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold lg:inline-flex",
        error
          ? "border-[color-mix(in_srgb,var(--danger)_28%,var(--border))] bg-[var(--danger-soft)] text-[var(--danger)]"
          : "border-[var(--dashboard-border)] bg-[var(--surface-2)] text-[var(--accent-strong)]",
      )}
    >
      <Icon aria-hidden="true" className={cn("size-3.5", saving && "animate-spin")} />
      {label}
    </span>
  );
}
