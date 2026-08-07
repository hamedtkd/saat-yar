"use client";

import { CalendarPlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { PanelHead } from "@/components/common/panel-head";
import { JalaliDatePicker } from "@/components/pickers";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { jalali, localDateKey } from "@/lib/format";
import {
  cloneHolidayOverrides, createHolidayOverrideInput, normalizeHolidayOverrides,
  upsertHolidayOverride, validateHolidayOverrideInput,
} from "@/lib/holiday-overrides";
import type { AppData, HolidayOverride } from "@/lib/types";
import { EditableCardActions } from "./editing/editable-card-actions";

type Props = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
};

export function HolidayOverridesCard({ data, setData, setToast }: Props) {
  const [form, setForm] = useState(() => createHolidayOverrideInput(localDateKey()));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const editor = useSettingsDraft({
    value: cloneHolidayOverrides(data.holidayOverrides),
    autoSave: data.settings.autoSaveSettings,
    label: "تعطیلات و استثناهای دستی",
    prepare: normalizeHolidayOverrides,
    onSave: (holidayOverrides) => setData((previous) => ({
      ...previous,
      holidayOverrides: cloneHolidayOverrides(holidayOverrides),
    })),
  });
  const items = [...editor.draft].sort((left, right) => right.date.localeCompare(left.date));

  const resetForm = () => {
    setForm(createHolidayOverrideInput(localDateKey()));
    setEditingId(null);
  };

  const beginEdit = () => {
    resetForm();
    editor.beginEdit();
  };

  const cancel = () => {
    resetForm();
    editor.cancel();
  };

  const saveCard = () => {
    editor.save();
    resetForm();
    setToast("تعطیلات و استثناهای دستی ذخیره شد");
  };

  const submitForm = () => {
    const error = validateHolidayOverrideInput(form, editor.draft, editingId);
    if (error) return setToast(error);
    const result = upsertHolidayOverride(editor.draft, form, () => crypto.randomUUID(), editingId);
    editor.update(result.items);
    resetForm();
    setToast(data.settings.autoSaveSettings
      ? result.updated ? "استثنای تعطیلی به‌روزرسانی شد" : "استثنای تعطیلی ذخیره شد"
      : result.updated ? "استثنا در پیش‌نویس به‌روزرسانی شد" : "استثنا به پیش‌نویس اضافه شد");
  };

  const editItem = (item: HolidayOverride) => {
    setEditingId(item.id);
    setForm({
      date: item.date,
      title: item.title,
      kind: item.kind,
      isHoliday: item.isHoliday,
      multiplier: item.multiplier,
    });
  };

  const confirmRemoval = () => {
    if (!pendingRemovalId) return;
    editor.update((current) => current.filter((item) => item.id !== pendingRemovalId));
    if (editingId === pendingRemovalId) resetForm();
    setPendingRemovalId(null);
    setToast(data.settings.autoSaveSettings
      ? "استثنای تعطیلی حذف شد"
      : "استثنا از پیش‌نویس حذف شد؛ برای اعمال، ذخیره کن");
  };

  return (
    <section className="col-span-full overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <div className="border-b border-[var(--border)] p-5">
        <PanelHead icon={<CalendarPlus />} title="تعطیلات و استثناهای دستی">
          <EditableCardActions
            editing={editor.manualEditing}
            dirty={editor.dirty}
            autoSave={data.settings.autoSaveSettings}
            onEdit={beginEdit}
            onSave={saveCard}
            onCancel={cancel}
          />
        </PanelHead>
        <p className="text-[10px] leading-6 text-[var(--text-muted)]">
          تعطیلی شرکتی یا اضطراری ثبت کن، یا یک تعطیلی رسمی را برای مجموعه به روز کاری تبدیل کن.
        </p>
      </div>

      {editor.editing && (
        <fieldset className="grid gap-4 border-b border-[var(--border)] p-4 sm:p-5">
          <div className="grid grid-cols-[minmax(210px,1.2fr)_minmax(170px,.8fr)_minmax(220px,1.4fr)_auto] items-end gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
            <label>تاریخ<JalaliDatePicker value={form.date} onChange={(date) => setForm((current) => ({ ...current, date }))} mode={data.settings.mode} includeOfficialHolidays={data.settings.autoOfficialHolidays} includeWeeklyHoliday={data.settings.autoWeeklyHoliday} holidayOverrides={editor.draft} /></label>
            <label>نوع<Select value={form.kind} onValueChange={(kind) => setForm((current) => ({ ...current, kind: kind as HolidayOverride["kind"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="company">تعطیلی شرکت</SelectItem><SelectItem value="emergency">تعطیلی اضطراری</SelectItem><SelectItem value="manual">استثنای دستی</SelectItem></SelectContent></Select></label>
            <label>عنوان<Input maxLength={100} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="مثلاً تعطیلی شرکت" /></label>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] px-3"><Checkbox checked={form.isHoliday} onCheckedChange={(isHoliday) => setForm((current) => ({ ...current, isHoliday }))} /><span className="text-[10px] font-bold">این روز تعطیل است</span></label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={submitForm}><Plus /> {editingId ? "به‌روزرسانی پیش‌نویس" : "افزودن به پیش‌نویس"}</Button>
            {editingId && <Button type="button" variant="ghost" onClick={resetForm}><X /> لغو ویرایش ردیف</Button>}
          </div>
        </fieldset>
      )}

      <div className="grid gap-2 p-4 sm:p-5">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
            <div>
              <strong className="block text-[11px] text-[var(--text)]">{item.title}</strong>
              <small className="text-[9px] text-[var(--text-muted)]">{jalali(item.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {item.isHoliday ? "تعطیل" : "روز کاری"}</small>
            </div>
            {editor.editing && <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => editItem(item)} aria-label={`ویرایش ${item.title}`}><Pencil className="size-4" /></Button>
              <Button type="button" variant="destructive" size="icon" onClick={() => setPendingRemovalId(item.id)} aria-label={`حذف ${item.title}`}><Trash2 className="size-4" /></Button>
            </div>}
          </div>
        ))}
        {!items.length && <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center text-xs text-[var(--text-muted)]">هنوز استثنای تعطیلی ثبت نشده است.</div>}
      </div>

      <AlertDialog open={Boolean(pendingRemovalId)} onOpenChange={(open: boolean) => !open && setPendingRemovalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>این استثنای تعطیلی حذف شود؟</AlertDialogTitle>
            <AlertDialogDescription>در حالت ذخیره دستی، حذف ابتدا فقط روی پیش‌نویس اعمال می‌شود و با انصراف قابل بازگشت است. در حالت ذخیره خودکار، حذف بلافاصله ثبت خواهد شد.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95" onClick={confirmRemoval}>بله، حذف شود</AlertDialogAction>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
