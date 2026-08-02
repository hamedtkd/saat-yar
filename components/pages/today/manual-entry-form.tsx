"use client";

import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TodayPageProps } from "./types";
import { cn } from "@/lib/cn";

export function ManualEntryForm(props: Pick<TodayPageProps, "data" | "selectedDate" | "setData" | "setEditingEntry">) {
  const [draft, setDraft] = useState({ projectId: props.data.projects.find((item) => item.status === "active")?.id ?? "", start: "09:00", end: "10:00", note: "", billable: true });
  function save() {
    const project = props.data.projects.find((item) => item.id === draft.projectId);
    if (!project) return alert("برای ثبت دستی، ابتدا پروژه را انتخاب کنید.");
    const startedAt = new Date(`${props.selectedDate}T${draft.start}:00`).getTime();
    const endedAt = new Date(`${props.selectedDate}T${draft.end}:00`).getTime();
    if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt) || endedAt <= startedAt) return alert("زمان شروع و پایان معتبر نیست.");
    const overlaps = props.data.timeEntries.some((entry) => startedAt < (entry.endedAt ? new Date(entry.endedAt).getTime() : Date.now()) && endedAt > new Date(entry.startedAt).getTime());
    if (overlaps) return alert("این بازه با رکورد دیگری هم‌پوشانی دارد.");
    props.setData((previous) => ({ ...previous, timeEntries: [{ id: crypto.randomUUID(), clientId: project.clientId, projectId: project.id, task: draft.note || "ورودی دستی", startedAt: new Date(startedAt).toISOString(), endedAt: new Date(endedAt).toISOString(), note: draft.note, billable: draft.billable, effectiveRate: project.rate }, ...previous.timeEntries] }));
    props.setEditingEntry("");
  }
  return (
    <section className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "mb-[18px] p-5 [&_.panel-head]:mb-4")}>
      <PanelHead icon={<Plus />} title="ثبت دستی زمان پروژه"><Button variant="ghost" onClick={() => props.setEditingEntry("")}>بستن</Button></PanelHead>
      <div className={cn("mb-4 grid gap-[14px]", "grid-cols-3 max-[620px]:grid-cols-1")}><label>پروژه<Select value={draft.projectId} onValueChange={(projectId) => setDraft({ ...draft, projectId })}><SelectTrigger><SelectValue placeholder="انتخاب پروژه" /></SelectTrigger><SelectContent>{props.data.projects.filter((item) => item.status === "active").map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></label><label>شروع<TimePicker value={draft.start} onChange={(start) => setDraft({ ...draft, start })} /></label><label>پایان<TimePicker value={draft.end} onChange={(end) => setDraft({ ...draft, end })} /></label><label className={cn("col-span-2 max-[620px]:col-auto")}>شرح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder="مثلاً جلسه طراحی" /></label><label className={cn("flex min-h-11 items-center gap-[9px] self-end text-[#102a3a] [&_input]:h-[18px] [&_input]:w-[18px] [&_input]:accent-[#079b60]")}><input type="checkbox" checked={draft.billable} onChange={(event) => setDraft({ ...draft, billable: event.target.checked })} /> قابل صورتحساب</label></div>
      <Button onClick={save}><Save /> ذخیره ورودی</Button>
    </section>
  );
}
