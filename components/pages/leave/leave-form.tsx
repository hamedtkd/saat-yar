import { Info, Plus, Save } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tw } from "@/lib/tw";
import type { LeaveEntry } from "@/lib/types";

export function LeaveForm({ draft, setDraft, onSave }: {
  draft: LeaveEntry;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
  onSave: () => void;
}) {
  return (
    <article className={tw("panel", "leave-form")}>
      <PanelHead icon={<Plus />} title={draft.id ? "ویرایش مرخصی" : "ثبت مرخصی جدید"} />
      <div className={tw("form-grid", "two")}>
        <label>نوع مرخصی<Select value={draft.type} onValueChange={(type) => setDraft({ ...draft, type: type as LeaveEntry["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full">روز کامل</SelectItem><SelectItem value="half">نیم‌روز</SelectItem><SelectItem value="hourly">ساعتی</SelectItem></SelectContent></Select></label>
        {draft.type === "hourly" && <label>مدت (دقیقه)<NumberField value={draft.minutes} onValueChange={(minutes) => setDraft({ ...draft, minutes })} /></label>}
        <label>از تاریخ<JalaliDatePicker value={draft.startDate} onChange={(startDate) => setDraft({ ...draft, startDate })} /></label>
        <label>تا تاریخ<JalaliDatePicker value={draft.endDate} onChange={(endDate) => setDraft({ ...draft, endDate })} /></label>
        <label className={tw("span-2")}>توضیح اختیاری<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label>
      </div>
      <Button className={tw("full")} onClick={onSave}><Save /> {draft.id ? "ذخیره تغییرات" : "ثبت مرخصی"}</Button>
      <p className={tw("helper")}><Info />این اپ شخصی است و فرایند تأیید سازمانی ندارد.</p>
    </article>
  );
}
