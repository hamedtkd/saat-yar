"use client";

import { Banknote, Layers3, PlusCircle } from "lucide-react";
import { useState } from "react";
import { NumberField } from "@/components/common/number-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateOnboardingSalary } from "@/lib/onboarding-settings";
import { addOnboardingWorkspace } from "@/lib/onboarding-workspace";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { UpdateSettings } from "./types";

export function HybridIncomeStep({ data, setData, updateSettings }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  updateSettings: UpdateSettings;
}) {
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [rate, setRate] = useState(850_000);
  const [status, setStatus] = useState("");

  function saveWorkspace() {
    if (!clientName.trim()) return setStatus("برای ساخت فضای فریلنسری سریع، نام مشتری را وارد کن.");
    const result = addOnboardingWorkspace(data, { clientName, projectName, rate, budgetHours: 60 });
    setData(result.data);
    setStatus(result.projectId ? "مشتری و پروژه فریلنسری آماده شدند." : "مشتری آماده شد؛ پروژه را بعداً هم می‌توانی بسازی.");
    setClientName(""); setProjectName("");
  }

  return (
    <StepShell>
      <div className="mx-auto mb-7 max-w-[720px] text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Layers3 /></span>
        <h1>درآمد کارمندی و فریلنسری را کنار هم آماده کن</h1>
        <p>در حالت ترکیبی فقط اطلاعاتی را می‌گیریم که برای شروع هر دو فضای کاری لازم است؛ جزئیات پیشرفته بعداً در Settings قابل تنظیم‌اند.</p>
      </div>
      <div className="mx-auto grid max-w-[900px] gap-4 lg:grid-cols-2" data-onboarding-hybrid-income data-onboarding-inline-form>
        <section className="grid content-start gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-4 text-right">
          <div><strong className="inline-flex items-center gap-2 text-sm text-[var(--text)]"><Banknote className="size-4 text-[var(--accent-strong)]" /> درآمد کارمندی</strong><p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">حقوق ماهانه با Payroll Policy ماهانه همگام می‌شود.</p></div>
          <NumberField data-onboarding-salary min={0} step={500_000} value={data.settings.salary} onValueChange={(salary) => updateSettings((current) => updateOnboardingSalary(current, salary))} />
          <small className="text-[10px] text-[var(--text-muted)]">برای نداشتن محاسبه مبلغ پایه، صفر بگذار.</small>
        </section>
        <section className="grid content-start gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-4 text-right">
          <div><strong className="inline-flex items-center gap-2 text-sm text-[var(--text)]"><PlusCircle className="size-4 text-[var(--accent-strong)]" /> شروع سریع فریلنسری</strong><p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">یک مشتری و پروژه نمونه بساز؛ هر دو اختیاری‌اند.</p></div>
          <Input data-onboarding-client-name value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="نام مشتری" />
          <Input data-onboarding-project-name value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="نام پروژه (اختیاری)" />
          <NumberField data-onboarding-project-rate min={0} step={50_000} value={rate} onValueChange={setRate} />
          <Button type="button" variant="outline" data-onboarding-workspace-create onClick={saveWorkspace}>ساخت فضای فریلنسری</Button>
          {status && <p role="status" className="text-[10px] font-semibold text-[var(--accent-strong)]">{status}</p>}
        </section>
      </div>
    </StepShell>
  );
}
