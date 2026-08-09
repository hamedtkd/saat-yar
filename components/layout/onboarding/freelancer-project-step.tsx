"use client";

import { FolderKanban, WalletCards } from "lucide-react";
import { useState } from "react";
import { NumberField } from "@/components/common/number-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addOnboardingProject } from "@/lib/onboarding-workspace";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";

export function FreelancerProjectStep({ data, setData }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}) {
  const [clientId, setClientId] = useState(data.clients.find((client) => !client.archived)?.id ?? "");
  const [name, setName] = useState("");
  const [rate, setRate] = useState(850_000);
  const [budgetHours, setBudgetHours] = useState(60);
  const [status, setStatus] = useState("");

  function saveProject() {
    if (!clientId) return setStatus("برای ساخت پروژه، یک مشتری لازم است. می‌توانی با «قبلی» برگردی یا این مرحله را رد کنی.");
    if (!name.trim()) return setStatus("نام پروژه را وارد کن یا این مرحله را فعلاً رد کن.");
    const result = addOnboardingProject(data, { clientId, name, rate, budgetHours });
    setData(result.data);
    setStatus(result.created ? "پروژه آماده شد و نرخ آن برای تایمرهای قابل‌صورتحساب استفاده می‌شود." : "این پروژه برای مشتری انتخاب‌شده از قبل وجود داشت.");
    if (result.created) setName("");
  }

  return (
    <StepShell>
      <div className="mx-auto mb-7 max-w-[700px] text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><FolderKanban /></span>
        <h1>اولین پروژه و نرخ کاری‌ات</h1>
        <p>نرخ پروژه پایه محاسبه درآمد تایمر است. بودجه زمانی هم برای هشدار نزدیک‌شدن به سقف پروژه استفاده می‌شود.</p>
      </div>

      <div className="mx-auto grid max-w-[820px] gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-4 text-right sm:grid-cols-2 sm:p-5" data-onboarding-freelancer-project data-onboarding-inline-form>
        <label className="grid gap-2 text-[11px] font-bold text-[var(--text-muted)] sm:col-span-2">مشتری
          <Select value={clientId} onValueChange={setClientId} disabled={data.clients.length === 0}>
            <SelectTrigger data-onboarding-project-client><SelectValue placeholder={data.clients.length ? "مشتری را انتخاب کن" : "هنوز مشتری نداری"} /></SelectTrigger>
            <SelectContent>{data.clients.filter((client) => !client.archived).map((client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}</SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-[11px] font-bold text-[var(--text-muted)] sm:col-span-2">نام پروژه
          <Input data-onboarding-project-name value={name} onChange={(event) => setName(event.target.value)} placeholder="مثلاً طراحی وب‌سایت" />
        </label>
        <label className="grid gap-2 text-[11px] font-bold text-[var(--text-muted)]">نرخ ساعتی <span className="font-normal">تومان</span>
          <NumberField data-onboarding-project-rate min={0} step={50_000} value={rate} onValueChange={setRate} />
        </label>
        <label className="grid gap-2 text-[11px] font-bold text-[var(--text-muted)]">بودجه زمانی <span className="font-normal">ساعت</span>
          <NumberField min={0} step={1} value={budgetHours} onValueChange={setBudgetHours} />
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <Button type="button" data-onboarding-project-create onClick={saveProject} disabled={data.clients.length === 0}><WalletCards /> ذخیره پروژه</Button>
          <span className="text-[10px] leading-5 text-[var(--text-muted)]">اگر پروژه‌های زیادی داری، مرحله Import برای CSV سریع‌تر است.</span>
        </div>
        {status && <p role="status" className="text-[10px] font-semibold leading-5 text-[var(--accent-strong)] sm:col-span-2">{status}</p>}
      </div>
    </StepShell>
  );
}
