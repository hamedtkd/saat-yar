"use client";

import { CalendarPlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PanelHead } from "@/components/common/panel-head";
import { JalaliDatePicker } from "@/components/pickers";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { localDateKey } from "@/lib/format";
import { cloneHolidayOverrides, createHolidayOverrideInput, normalizeHolidayOverrides, upsertHolidayOverride, validateHolidayOverrideInput } from "@/lib/holiday-overrides";
import type { AppData, HolidayOverride } from "@/lib/types";
import { EditableCardActions } from "./editing/editable-card-actions";

type Props = { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void };

export function HolidayOverridesCard({ data, setData, setToast }: Props) {
  const { date, locale, s } = useSystemUi();
  const [form, setForm] = useState(() => createHolidayOverrideInput(localDateKey()));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const editor = useSettingsDraft({ value: cloneHolidayOverrides(data.holidayOverrides), autoSave: data.settings.autoSaveSettings, label: s("Manual holidays and exceptions"), prepare: normalizeHolidayOverrides, onSave: (holidayOverrides) => setData((previous) => ({ ...previous, holidayOverrides: cloneHolidayOverrides(holidayOverrides) })) });
  const items = [...editor.draft].sort((left, right) => right.date.localeCompare(left.date));
  const resetForm = () => { setForm(createHolidayOverrideInput(localDateKey())); setEditingId(null); };
  const beginEdit = () => { resetForm(); editor.beginEdit(); };
  const cancel = () => { resetForm(); editor.cancel(); };
  const saveCard = () => { editor.save(); resetForm(); setToast(s("Manual holidays and exceptions were saved")); };
  const submitForm = () => {
    const error = validateHolidayOverrideInput(form, editor.draft, editingId, locale);
    if (error) return setToast(error);
    const result = upsertHolidayOverride(editor.draft, form, () => crypto.randomUUID(), editingId);
    editor.update(result.items); resetForm();
    setToast(data.settings.autoSaveSettings ? (result.updated ? s("Holiday exception was updated") : s("Holiday exception was saved")) : (result.updated ? s("Exception was updated in the draft") : s("Exception was added to the draft")));
  };
  const editItem = (item: HolidayOverride) => { setEditingId(item.id); setForm({ date: item.date, title: item.title, kind: item.kind, isHoliday: item.isHoliday, multiplier: item.multiplier }); };
  const confirmRemoval = () => {
    if (!pendingRemovalId) return;
    editor.update((current) => current.filter((item) => item.id !== pendingRemovalId));
    if (editingId === pendingRemovalId) resetForm();
    setPendingRemovalId(null);
    setToast(data.settings.autoSaveSettings ? s("Holiday exception was deleted") : s("Exception was removed from the draft; save to apply"));
  };
  return (
    <section id="settings-holidays" className="col-span-full scroll-mt-24 overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <div className="border-b border-[var(--border)] p-5"><PanelHead icon={<CalendarPlus />} title={s("Manual holidays and exceptions")}><EditableCardActions editing={editor.manualEditing} dirty={editor.dirty} autoSave={data.settings.autoSaveSettings} onEdit={beginEdit} onSave={saveCard} onCancel={cancel} /></PanelHead><p className="text-[10px] leading-6 text-[var(--text-muted)]">{s("Add a company or emergency holiday, or turn an official holiday into a workday for your organization.")}</p></div>
      {editor.editing && <fieldset className="grid gap-4 border-b border-[var(--border)] p-4 sm:p-5"><div className="grid grid-cols-[minmax(210px,1.2fr)_minmax(170px,.8fr)_minmax(220px,1.4fr)_auto] items-end gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1"><label>{s("Date")}<JalaliDatePicker value={form.date} onChange={(nextDate) => setForm((current) => ({ ...current, date: nextDate }))} mode={data.settings.mode} includeOfficialHolidays={data.settings.autoOfficialHolidays} includeWeeklyHoliday={data.settings.autoWeeklyHoliday} holidayOverrides={editor.draft} /></label><label>{s("Type")}<Select value={form.kind} onValueChange={(kind) => setForm((current) => ({ ...current, kind: kind as HolidayOverride["kind"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="company">{s("Company holiday")}</SelectItem><SelectItem value="emergency">{s("Emergency holiday")}</SelectItem><SelectItem value="manual">{s("Manual exception")}</SelectItem></SelectContent></Select></label><label>{s("Title")}<Input maxLength={100} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder={s("For example, company holiday")} /></label><label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] px-3"><Checkbox checked={form.isHoliday} onCheckedChange={(isHoliday) => setForm((current) => ({ ...current, isHoliday }))} /><span className="text-[10px] font-bold">{s("This day is a holiday")}</span></label></div><div className="flex flex-wrap gap-2"><Button type="button" onClick={submitForm}><Plus /> {editingId ? s("Update draft") : s("Add to draft")}</Button>{editingId && <Button type="button" variant="ghost" onClick={resetForm}><X /> {s("Cancel row editing")}</Button>}</div></fieldset>}
      <div className="grid gap-2 p-4 sm:p-5">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5"><div><strong className="block text-[11px] text-[var(--text)]">{item.title}</strong><small className="text-[9px] text-[var(--text-muted)]">{date(item.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {item.isHoliday ? s("Holiday") : s("Workday")}</small></div>{editor.editing && <div className="flex gap-2"><Button type="button" variant="outline" size="icon" onClick={() => editItem(item)} aria-label={s("Edit {item}", { item: item.title })}><Pencil className="size-4" /></Button><Button type="button" variant="destructive" size="icon" onClick={() => setPendingRemovalId(item.id)} aria-label={s("Delete {item}", { item: item.title })}><Trash2 className="size-4" /></Button></div>}</div>)}{!items.length && <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center text-xs text-[var(--text-muted)]">{s("No holiday exception has been added yet.")}</div>}</div>
      <AlertDialog open={Boolean(pendingRemovalId)} onOpenChange={(open: boolean) => !open && setPendingRemovalId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{s("Delete this holiday exception?")}</AlertDialogTitle><AlertDialogDescription>{s("In manual-save mode, deletion first changes only the draft and Cancel can restore it. In autosave mode, deletion is saved immediately.")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogAction className="border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95" onClick={confirmRemoval}>{s("Yes, delete")}</AlertDialogAction><AlertDialogCancel>{s("Cancel")}</AlertDialogCancel></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </section>
  );
}
