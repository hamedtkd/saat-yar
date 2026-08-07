"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableCardActions } from "./editing/editable-card-actions";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { getUnsavedSettingsDraftLabelsExcept } from "@/lib/settings-draft-registry";
import type { AppData } from "@/lib/types";

const CARD_LABEL = "رفتار ذخیره تنظیمات";

export function SettingsBehaviorCard({
  data,
  setData,
  setToast,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
}) {
  const [blockingLabels, setBlockingLabels] = useState<string[]>([]);
  const editor = useSettingsDraft({
    value: { autoSaveSettings: data.settings.autoSaveSettings },
    autoSave: false,
    label: CARD_LABEL,
    onSave: ({ autoSaveSettings }) => {
      setData((previous) => ({
        ...previous,
        settings: { ...previous.settings, autoSaveSettings },
      }));
      setToast(autoSaveSettings
        ? "ذخیره خودکار تنظیمات فعال شد."
        : "ذخیره دستی تنظیمات فعال شد.");
    },
  });

  const beginEdit = () => {
    setBlockingLabels([]);
    editor.beginEdit();
  };
  const cancel = () => {
    setBlockingLabels([]);
    editor.cancel();
  };
  const save = () => {
    const otherDirtyLabels = getUnsavedSettingsDraftLabelsExcept(editor.registryId);
    if (editor.draft.autoSaveSettings && otherDirtyLabels.length > 0) {
      setBlockingLabels(otherDirtyLabels);
      setToast("ابتدا پیش‌نویس‌های باز را ذخیره یا لغو کن.");
      return;
    }
    setBlockingLabels([]);
    editor.save();
  };

  const enabled = editor.draft.autoSaveSettings;
  return (
    <section id="settings-behavior" className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5">
      <PanelHead icon={<Save />} title={CARD_LABEL}>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatusBadge tone={data.settings.autoSaveSettings ? "success" : "neutral"}>
            {data.settings.autoSaveSettings ? "خودکار" : "دستی"}
          </StatusBadge>
          <EditableCardActions
            editing={editor.manualEditing}
            dirty={editor.dirty}
            autoSave={false}
            onEdit={beginEdit}
            onSave={save}
            onCancel={cancel}
          />
        </div>
      </PanelHead>

      <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 has-[:disabled]:cursor-default">
        <Checkbox
          className="mt-0.5"
          checked={enabled}
          disabled={!editor.editing}
          onCheckedChange={(checked) => {
            setBlockingLabels([]);
            editor.update({ autoSaveSettings: checked });
          }}
        />
        <span className="grid gap-1">
          <strong className="text-[11px] text-[var(--text)]">ذخیره خودکار تغییرات تنظیمات</strong>
          <small className="text-[9px] leading-5 text-[var(--text-muted)]">
            به‌صورت پیش‌فرض خاموش است. این کنترل همیشه با ذخیره صریح تغییر می‌کند. در حالت دستی، هر کارت پیش‌نویس مستقل دارد؛ در حالت خودکار، تغییرات معتبر همان لحظه ثبت می‌شوند.
          </small>
        </span>
      </label>

      {blockingLabels.length > 0 && (
        <div className="mt-3 rounded-xl border border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] p-3 text-[10px] leading-5 text-[var(--warning)]" role="alert">
          <strong className="block">فعال‌سازی ذخیره خودکار فعلاً امن نیست.</strong>
          ابتدا تغییرات این کارت‌ها را ذخیره یا لغو کن: {blockingLabels.join("، ")}
        </div>
      )}

      <p className="mt-3 text-[10px] leading-5 text-[var(--text-muted)]">
        برای جلوگیری از از‌دست‌رفتن پیش‌نویس‌ها، تا وقتی کارت دیگری تغییر ذخیره‌نشده دارد، فعال‌کردن ذخیره خودکار مسدود می‌ماند.
      </p>
    </section>
  );
}
