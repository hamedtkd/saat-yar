import { Info, Plus, Save } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LeaveEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

export function LeaveForm({ draft, setDraft, onSave }: {
  draft: LeaveEntry;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
  onSave: () => void;
}) {
  return (
    <article className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "self-start p-5")}>
      <PanelHead icon={<Plus />} title={draft.id ? "ویرایش مرخصی" : "ثبت مرخصی جدید"} />
      <div className={cn("mb-4 grid gap-[14px]", "grid-cols-2 max-[620px]:grid-cols-1")}>
        <label>نوع مرخصی<Select value={draft.type} onValueChange={(type) => setDraft({ ...draft, type: type as LeaveEntry["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full">روز کامل</SelectItem><SelectItem value="half">نیم‌روز</SelectItem><SelectItem value="hourly">ساعتی</SelectItem></SelectContent></Select></label>
        {draft.type === "hourly" && <label>مدت (دقیقه)<NumberField value={draft.minutes} onValueChange={(minutes) => setDraft({ ...draft, minutes })} /></label>}
        <label>از تاریخ<JalaliDatePicker value={draft.startDate} onChange={(startDate) => setDraft({ ...draft, startDate })} /></label>
        <label>تا تاریخ<JalaliDatePicker value={draft.endDate} onChange={(endDate) => setDraft({ ...draft, endDate })} /></label>
        <label className={cn("col-span-2 max-[620px]:col-auto")}>توضیح اختیاری<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label>
      </div>
      <Button className={cn("w-full")} onClick={onSave}><Save /> {draft.id ? "ذخیره تغییرات" : "ثبت مرخصی"}</Button>
      <p className={cn("mt-3 flex items-start gap-[7px] text-[10px] leading-[1.8] text-[#6c7d89] [&_svg]:mt-0.5 [&_svg]:w-[14px] [&_svg]:flex-none")}><Info />این اپ شخصی است و فرایند تأیید سازمانی ندارد.</p>
    </article>
  );
}
