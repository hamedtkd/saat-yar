"use client";

import { UserRound } from "lucide-react";
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
  const valid = name.trim().length > 0 && name.trim().length <= MAX_NAME_LENGTH;

  return (
    <section className="col-span-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
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

      <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
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
        <div className="grid gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2.5 text-xs">
          <span className="text-[var(--text-muted)]">نمونه خوشامدگویی</span>
          <strong className="truncate text-[var(--text)]">
            {name.trim() ? `صبح بخیر، ${name.trim()}` : "صبح بخیر"}
          </strong>
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
