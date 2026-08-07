"use client";

import { Settings } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { money } from "@/lib/format";
import { dailyBaseSalary } from "@/lib/payroll";
import type { AppData, Mode } from "@/lib/types";
import { EditableCardActions } from "./editing/editable-card-actions";
import { WorkScheduleEditor } from "./work-schedule-editor";
import { createWorkSettingsDraft, type WorkSettingsDraft } from "./work-settings-types";

export function WorkSettingsCard({ data, setData, setToast, financialsHidden }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
  financialsHidden: boolean;
}) {
  const value = createWorkSettingsDraft(data.settings);
  const saveSettings = (next: WorkSettingsDraft) => setData((previous) => ({
    ...previous,
    settings: { ...previous.settings, ...next },
  }));
  const editor = useSettingsDraft({ value, autoSave: data.settings.autoSaveSettings, label: "تنظیمات کاری و حقوق", onSave: saveSettings });
  const settings = editor.draft;
  const canEdit = editor.editing;
  const setSetting = <K extends keyof WorkSettingsDraft>(key: K, next: WorkSettingsDraft[K]) => editor.update((previous) => ({ ...previous, [key]: next }));

  return (
    <section className="col-span-full scroll-mt-24 overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)] max-[620px]:col-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] p-5">
        <div className="grid gap-2"><PanelHead icon={<Settings />} title="تنظیمات کاری و حقوق" /><p className="text-[10px] leading-5 text-[var(--text-muted)]">برای تغییر برنامه کاری از مداد استفاده کن؛ تا زمان ذخیره، داده اصلی تغییر نمی‌کند.</p></div>
        <EditableCardActions editing={editor.manualEditing} dirty={editor.dirty} autoSave={data.settings.autoSaveSettings} onEdit={editor.beginEdit} onSave={() => { editor.save(); setToast("تنظیمات کاری ذخیره شد"); }} onCancel={editor.cancel} />
      </div>

      <fieldset disabled={!canEdit} className="grid gap-5 p-4 disabled:opacity-70 sm:p-5">
        <div className="grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
          <label>نوع استفاده<Select value={settings.mode} onValueChange={(mode) => setSetting("mode", mode as Mode)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="employee">کارمند</SelectItem><SelectItem value="freelancer">فریلنسر</SelectItem><SelectItem value="hybrid">ترکیبی</SelectItem></SelectContent></Select></label>
          <label className="grid gap-[7px]">حقوق ماهانه (تومان){financialsHidden ? <div className="flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-lg font-black tracking-[.2em] text-[var(--text-muted)]">••••••</div> : <NumberField value={settings.salary} onValueChange={(next) => setSetting("salary", next)} />}<small className="text-[10px] font-medium text-[var(--text-muted)]">حقوق پایه روزانه: {financialsHidden ? "••••••" : money(dailyBaseSalary(settings.salary))} تومان</small></label>
          <label>ضریب اضافه‌کاری<NumberField value={settings.overtimeMultiplier} min={0} onValueChange={(next) => setSetting("overtimeMultiplier", next)} /></label>
          <label>ضریب روز تعطیل<NumberField value={settings.holidayMultiplier} min={0} onValueChange={(next) => setSetting("holidayMultiplier", next)} /></label>
          <Toggle checked={settings.autoOfficialHolidays} onChange={(next) => setSetting("autoOfficialHolidays", next)} title="تشخیص تعطیلات رسمی" description="تعطیلات رسمی هدف روز را صفر می‌کند." />
          <Toggle checked={settings.autoWeeklyHoliday} onChange={(next) => setSetting("autoWeeklyHoliday", next)} title="جمعه به‌عنوان تعطیل هفتگی" description="کارکرد جمعه با ضریب تعطیل محاسبه می‌شود." />
        </div>
        <WorkScheduleEditor value={settings} disabled={!canEdit} onChange={editor.update} />
      </fieldset>
    </section>
  );
}

function Toggle({ checked, onChange, title, description }: { checked: boolean; onChange: (next: boolean) => void; title: string; description: string }) {
  return <label className="flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)]"><Checkbox checked={checked} onCheckedChange={onChange} /><span className="grid gap-0.5"><strong className="text-[11px]">{title}</strong><small className="text-[9px] text-[var(--text-muted)]">{description}</small></span></label>;
}
