"use client";

import { Settings } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PanelHead } from "@/components/common/panel-head";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import type { AppData, Mode } from "@/lib/types";
import { EditableCardActions } from "./editing/editable-card-actions";
import { WorkScheduleEditor } from "./work-schedule-editor";
import { createWorkSettingsDraft, type WorkSettingsDraft } from "./work-settings-types";
import { mergeWorkSettings } from "@/lib/work-settings-sync";

export function WorkSettingsCard({ data, setData, setToast }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void }) {
  const { s } = useSystemUi();
  const value = createWorkSettingsDraft(data.settings);
  const saveSettings = (next: WorkSettingsDraft) => setData((previous) => ({ ...previous, settings: mergeWorkSettings(previous.settings, next) }));
  const editor = useSettingsDraft({ value, autoSave: data.settings.autoSaveSettings, label: s("Work settings"), onSave: saveSettings });
  const settings = editor.draft;
  const canEdit = editor.editing;
  const setSetting = <K extends keyof WorkSettingsDraft>(key: K, next: WorkSettingsDraft[K]) => editor.update((previous) => ({ ...previous, [key]: next }));
  return (
    <section id="settings-work-schedule" className="col-span-full scroll-mt-24 overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)] max-[620px]:col-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] p-5"><div className="grid gap-2"><PanelHead icon={<Settings />} title={s("Work settings")} /><p className="text-[10px] leading-5 text-[var(--text-muted)]">{s("Edit your schedule, workspace mode, and holiday behavior here. Payroll calculation is configured in the separate card below.")}</p></div><EditableCardActions editing={editor.manualEditing} dirty={editor.dirty} autoSave={data.settings.autoSaveSettings} onEdit={editor.beginEdit} onSave={() => { editor.save(); setToast(s("Work settings were saved")); }} onCancel={editor.cancel} /></div>
      <fieldset disabled={!canEdit} className="grid gap-5 p-4 disabled:opacity-70 sm:p-5">
        <div className="grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
          <label>{s("Workspace mode")}<Select value={settings.mode} onValueChange={(mode) => setSetting("mode", mode as Mode)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="employee">{s("Employee")}</SelectItem><SelectItem value="freelancer">{s("Freelancer")}</SelectItem><SelectItem value="hybrid">{s("Hybrid")}</SelectItem></SelectContent></Select></label>
          <Toggle checked={settings.autoOfficialHolidays} onChange={(next) => setSetting("autoOfficialHolidays", next)} title={s("Detect official holidays")} description={s("Official holidays set the daily target to zero.")} />
          <Toggle checked={settings.autoWeeklyHoliday} onChange={(next) => setSetting("autoWeeklyHoliday", next)} title={s("Friday as weekly holiday")} description={s("Friday work is calculated with the holiday multiplier.")} />
        </div>
        <WorkScheduleEditor value={settings} disabled={!canEdit} onChange={editor.update} />
      </fieldset>
    </section>
  );
}

function Toggle({ checked, onChange, title, description }: { checked: boolean; onChange: (next: boolean) => void; title: string; description: string }) {
  return <label className="flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)]"><Checkbox checked={checked} onCheckedChange={onChange} /><span className="grid gap-0.5"><strong className="text-[11px]">{title}</strong><small className="text-[9px] text-[var(--text-muted)]">{description}</small></span></label>;
}
