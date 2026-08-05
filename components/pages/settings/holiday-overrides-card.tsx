"use client";

import { useState } from "react";
import { CalendarPlus, Save, Trash2 } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jalali, localDateKey } from "@/lib/format";
import type { AppData, HolidayOverride } from "@/lib/types";

const emptyDraft = (): Omit<HolidayOverride, "id"> => ({
  date: localDateKey(),
  title: "",
  kind: "company",
  isHoliday: true,
});

export function HolidayOverridesCard({ data, setData, setToast }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
}) {
  const [draft, setDraft] = useState(emptyDraft);

  function save() {
    if (!draft.title.trim()) return setToast("عنوان تعطیلی را وارد کنید");
    const existing = data.holidayOverrides.find((item) => item.date === draft.date);
    const next: HolidayOverride = { ...draft, id: existing?.id ?? crypto.randomUUID(), title: draft.title.trim() };
    setData((previous) => ({
      ...previous,
      holidayOverrides: existing
        ? previous.holidayOverrides.map((item) => item.id === existing.id ? next : item)
        : [...previous.holidayOverrides, next],
    }));
    setDraft(emptyDraft());
    setToast(existing ? "استثنای تعطیلی به‌روزرسانی شد" : "استثنای تعطیلی ذخیره شد");
  }

  function remove(id: string) {
    setData((previous) => ({ ...previous, holidayOverrides: previous.holidayOverrides.filter((item) => item.id !== id) }));
    setToast("استثنای تعطیلی حذف شد");
  }

  return (
    <section className="col-span-full rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[0_10px_35px_rgba(17,45,55,.055)] max-[620px]:col-auto">
      <PanelHead icon={<CalendarPlus />} title="تعطیلات و استثناهای دستی" />
      <p className="mb-4 text-[10px] leading-5 text-[var(--text-muted)]">برای تعطیلی شرکتی یا اضطراری یک روز را تعطیل کن؛ یا یک تعطیلی رسمی را برای مجموعه خودت روز کاری قرار بده.</p>
      <div className="mb-4 grid grid-cols-[minmax(220px,1.4fr)_minmax(180px,1fr)_minmax(220px,1.4fr)_auto] items-end gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label>تاریخ<JalaliDatePicker value={draft.date} onChange={(date) => setDraft((current) => ({ ...current, date }))} mode={data.settings.mode} includeOfficialHolidays={data.settings.autoOfficialHolidays} includeWeeklyHoliday={data.settings.autoWeeklyHoliday} holidayOverrides={data.holidayOverrides} /></label>
        <label>نوع<Select value={draft.kind} onValueChange={(kind) => setDraft((current) => ({ ...current, kind: kind as HolidayOverride["kind"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="company">تعطیلی شرکت</SelectItem><SelectItem value="emergency">تعطیلی اضطراری</SelectItem><SelectItem value="manual">استثنای دستی</SelectItem></SelectContent></Select></label>
        <label>عنوان<Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="مثلاً تعطیلی شرکت" /></label>
        <label className="flex min-h-13 cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] px-3"><Checkbox checked={draft.isHoliday} onCheckedChange={(isHoliday) => setDraft((current) => ({ ...current, isHoliday }))} /><span className="text-[10px] font-bold">این روز تعطیل است</span></label>
      </div>
      <Button onClick={save}><Save /> ذخیره استثنا</Button>

      {data.holidayOverrides.length > 0 && <div className="mt-5 grid gap-2">
        {[...data.holidayOverrides].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
          <div><strong className="block text-[11px] text-[var(--text)]">{item.title}</strong><small className="text-[9px] text-[var(--text-muted)]">{jalali(item.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {item.isHoliday ? "تعطیل" : "روز کاری"}</small></div>
          <Button variant="outline" size="icon" onClick={() => remove(item.id)} aria-label={`حذف ${item.title}`}><Trash2 className="size-4" /></Button>
        </div>)}
      </div>}
    </section>
  );
}
