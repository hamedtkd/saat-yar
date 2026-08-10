"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableCardActions } from "./editing/editable-card-actions";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { getUnsavedSettingsDraftLabelsExcept } from "@/lib/settings-draft-registry";
import type { AppData } from "@/lib/types";

export function SettingsBehaviorCard({ data, setData, setToast }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
}) {
  const { s } = useSystemUi();
  const [blockingLabels, setBlockingLabels] = useState<string[]>([]);
  const editor = useSettingsDraft({
    value: { autoSaveSettings: data.settings.autoSaveSettings },
    autoSave: false,
    label: s("Settings save behavior"),
    onSave: ({ autoSaveSettings }) => {
      setData((previous) => ({ ...previous, settings: { ...previous.settings, autoSaveSettings } }));
      setToast(autoSaveSettings ? s("Automatic settings saving was enabled.") : s("Manual settings saving was enabled."));
    },
  });

  const beginEdit = () => { setBlockingLabels([]); editor.beginEdit(); };
  const cancel = () => { setBlockingLabels([]); editor.cancel(); };
  const save = () => {
    const otherDirtyLabels = getUnsavedSettingsDraftLabelsExcept(editor.registryId);
    if (editor.draft.autoSaveSettings && otherDirtyLabels.length > 0) {
      setBlockingLabels(otherDirtyLabels);
      setToast(s("Save or cancel open drafts first."));
      return;
    }
    setBlockingLabels([]);
    editor.save();
  };

  const enabled = editor.draft.autoSaveSettings;
  return (
    <section id="settings-behavior" className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5">
      <PanelHead icon={<Save />} title={s("Settings save behavior")}>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatusBadge tone={data.settings.autoSaveSettings ? "success" : "neutral"}>{data.settings.autoSaveSettings ? s("Automatic") : s("Manual")}</StatusBadge>
          <EditableCardActions editing={editor.manualEditing} dirty={editor.dirty} autoSave={false} onEdit={beginEdit} onSave={save} onCancel={cancel} />
        </div>
      </PanelHead>
      <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 has-[:disabled]:cursor-default">
        <Checkbox className="mt-0.5" checked={enabled} disabled={!editor.editing} onCheckedChange={(checked) => { setBlockingLabels([]); editor.update({ autoSaveSettings: checked }); }} />
        <span className="grid gap-1">
          <strong className="text-[11px] text-[var(--text)]">{s("Automatically save settings changes")}</strong>
          <small className="text-[9px] leading-5 text-[var(--text-muted)]">{s("Off by default. This control always changes with an explicit save. In manual mode, each card has its own draft; in automatic mode, valid changes are saved immediately.")}</small>
        </span>
      </label>
      {blockingLabels.length > 0 && <div className="mt-3 rounded-xl border border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] p-3 text-[10px] leading-5 text-[var(--warning)]" role="alert"><strong className="block">{s("Enabling autosave is not safe yet.")}</strong>{s("Save or cancel changes in these cards first: {labels}", { labels: blockingLabels.join(", ") })}</div>}
      <p className="mt-3 text-[10px] leading-5 text-[var(--text-muted)]">{s("To protect open drafts, autosave stays blocked while another card has unsaved changes.")}</p>
    </section>
  );
}
