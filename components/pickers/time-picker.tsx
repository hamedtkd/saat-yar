"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { faDigits } from "@/lib/format";

export function TimePicker({ value, onChange, suggestions = [] }: {
  value: string;
  onChange: (value: string) => void;
  suggestions?: { label: string; value: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || "00:00");
  useEffect(() => setDraft(value || "00:00"), [value]);
  const [hour, minute] = draft.split(":");
  const hours = useMemo(() => Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0")), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")), []);

  return (
    <div className="relative min-w-0">
      <Button variant="outline" className="grid h-11 w-full grid-cols-[auto_1fr_auto] gap-[10px] text-right" onClick={() => setOpen(true)}>
        <Clock3 className="text-[#079b60]" />
        <strong className="justify-self-start" dir="ltr">{value ? faDigits(value) : "--:--"}</strong>
        <ChevronDown />
      </Button>
      {open && (
        <>
          <button aria-label="بستن انتخاب‌گر زمان" className="fixed inset-0 z-[700] border-0 bg-[#0a1f27]/15 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-[750] max-h-[calc(100vh-24px)] w-[min(360px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[15px] border border-[#dfe7e9] bg-white p-[14px] shadow-[0_24px_80px_rgba(17,45,55,.24)]">
            <div className="mb-[7px] grid grid-cols-2 gap-[25px] text-center text-[10px] text-[#6c7d89]"><span>ساعت</span><span>دقیقه</span></div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[7px]">
              <Select value={hour} onValueChange={(next) => setDraft(`${next}:${minute}`)}><SelectTrigger className="h-[58px] justify-center text-xl font-extrabold"><SelectValue /></SelectTrigger><SelectContent>{hours.map((item) => <SelectItem value={item} key={item}>{faDigits(item)}</SelectItem>)}</SelectContent></Select>
              <strong>:</strong>
              <Select value={minute} onValueChange={(next) => setDraft(`${hour}:${next}`)}><SelectTrigger className="h-[58px] justify-center text-xl font-extrabold"><SelectValue /></SelectTrigger><SelectContent>{minutes.map((item) => <SelectItem value={item} key={item}>{faDigits(item)}</SelectItem>)}</SelectContent></Select>
            </div>
            {suggestions.length > 0 && <div className="mt-3 grid grid-cols-2 gap-[7px]">{suggestions.map((item) => <Button key={`${item.label}-${item.value}`} variant="outline" className="justify-between" onClick={() => setDraft(item.value)}><span>{item.label}</span><b dir="ltr">{faDigits(item.value)}</b></Button>)}</div>}
            <Button className="mt-[10px] w-full" onClick={() => { onChange(draft); setOpen(false); }}><Check /> تأیید زمان</Button>
          </div>
        </>
      )}
    </div>
  );
}
