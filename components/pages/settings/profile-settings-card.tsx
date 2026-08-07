"use client";

import { ShieldCheck, UserRound } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Input } from "@/components/ui/input";
import { EditableCardActions } from "./editing/editable-card-actions";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import type { AppData } from "@/lib/types";

const MAX_NAME_LENGTH = 50;

export function ProfileSettingsCard({
  data,
  setData,
  setToast,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
}) {
  const profile = useSettingsDraft({
    value: { name: data.settings.name },
    autoSave: data.settings.autoSaveSettings,
    label: "پروفایل و نام نمایشی",
    onSave: ({ name }) => {
      const normalized = name.trim().slice(0, MAX_NAME_LENGTH);
      setData((previous) => ({
        ...previous,
        settings: { ...previous.settings, name: normalized },
      }));
      setToast(normalized ? "نام کاربر ذخیره شد." : "نام کاربر حذف شد.");
    },
  });

  const name = profile.draft.name;
  const normalizedName = name.trim();
  const valid = normalizedName.length > 0 && normalizedName.length <= MAX_NAME_LENGTH;
  const displayName = normalizedName || "کاربر ساعت‌یار";

  return (
    <section id="settings-profile" className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5">
      <PanelHead icon={<UserRound />} title="پروفایل و نام نمایشی">
        <EditableCardActions
          editing={profile.manualEditing}
          dirty={profile.dirty && valid}
          autoSave={data.settings.autoSaveSettings}
          onEdit={profile.beginEdit}
          onSave={profile.save}
          onCancel={profile.cancel}
        />
      </PanelHead>

      <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)] md:items-stretch">
        <div className="flex flex-col justify-between gap-4 rounded-[16px] bg-[var(--surface-2)] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-[15px] bg-[var(--accent-soft)] text-lg font-black text-[var(--accent-strong)]">
              {displayName.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-sm text-[var(--text)]">{displayName}</strong>
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">پروفایل محلی</span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-[9px] leading-5 text-[var(--text-muted)]">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
            نام و تنظیمات این پروفایل روی همین دستگاه نگه‌داری می‌شوند.
          </div>
        </div>

        <div className="grid content-center gap-3 rounded-[16px] bg-[var(--surface-2)] p-4">
          <label className="grid min-w-0 gap-2 text-xs font-semibold text-[var(--text-muted)]">
            نامی که در ساعت‌یار نمایش داده می‌شود
            <Input
              value={name}
              disabled={!profile.editing}
              maxLength={MAX_NAME_LENGTH}
              placeholder="مثلاً حامد"
              autoComplete="name"
              aria-invalid={profile.editing && !valid}
              onChange={(event) => profile.update({ name: event.target.value })}
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <span className="text-[var(--text-muted)]">نمونه خوشامدگویی</span>
            <strong className="text-[var(--text)]">{normalizedName ? `صبح بخیر، ${normalizedName}` : "صبح بخیر"}</strong>
          </div>
        </div>
      </div>

      {profile.editing && !valid && (
        <p className="mt-2 text-[10px] font-semibold text-[var(--danger)]" role="alert">
          نام باید حداقل یک نویسه و حداکثر {MAX_NAME_LENGTH} نویسه داشته باشد.
        </p>
      )}
      <p className="mt-3 text-[10px] leading-5 text-[var(--text-muted)]">
        این نام در سربرگ، منوی کناری و پیام‌های صبح‌بخیر، عصر‌بخیر و شب‌بخیر استفاده می‌شود.
      </p>
    </section>
  );
}
