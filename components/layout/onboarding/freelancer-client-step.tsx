"use client";

import { BriefcaseBusiness, CheckCircle2, UsersRound } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addOnboardingClient } from "@/lib/onboarding-workspace";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";

export function FreelancerClientStep({ data, setData }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  function saveClient() {
    const trimmed = name.trim();
    if (!trimmed) return setStatus("نام مشتری را وارد کن یا این مرحله را فعلاً رد کن.");
    const result = addOnboardingClient(data, { name: trimmed, email });
    setData(result.data);
    setStatus(result.created ? "مشتری اول آماده شد؛ مرحله بعد می‌توانی پروژه‌اش را بسازی." : "این مشتری از قبل وجود داشت و دوباره ساخته نشد.");
    setName("");
    setEmail("");
  }

  return (
    <StepShell>
      <div className="mx-auto mb-7 max-w-[700px] text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><UsersRound /></span>
        <h1>اولین مشتری‌ات را آماده کن</h1>
        <p>برای فضای فریلنسری، مشتری نقطه شروع پروژه، زمان قابل‌صورتحساب و فاکتور است. این مرحله اختیاری است.</p>
      </div>

      <div className="mx-auto grid max-w-[760px] gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-4 text-right sm:p-5" data-onboarding-freelancer-client data-onboarding-inline-form>
        <div className="flex items-center justify-between gap-3">
          <div><strong className="text-sm text-[var(--text)]">مشتری اول</strong><p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">اگر از قبل مشتری داری، می‌توانی در مرحله Import داده‌ها را یکجا وارد کنی.</p></div>
          <span className="inline-flex items-center gap-1 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-[10px] font-bold text-[var(--text-muted)]"><BriefcaseBusiness className="size-3.5" /> {data.clients.length.toLocaleString("fa-IR")} مشتری</span>
        </div>
        <label className="grid gap-2 text-[11px] font-bold text-[var(--text-muted)]">نام مشتری
          <Input data-onboarding-client-name value={name} onChange={(event) => setName(event.target.value)} placeholder="مثلاً استودیو آلفا" />
        </label>
        <label className="grid gap-2 text-[11px] font-bold text-[var(--text-muted)]">ایمیل <span className="font-normal">(اختیاری)</span>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} inputMode="email" placeholder="hello@example.com" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" data-onboarding-client-create onClick={saveClient}>ذخیره مشتری</Button>
          <span className="text-[10px] text-[var(--text-muted)]">بدون ساخت مشتری هم می‌توانی ادامه بدهی.</span>
        </div>
        {status && <p role="status" className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--accent-strong)]"><CheckCircle2 className="size-3.5" /> {status}</p>}
      </div>
    </StepShell>
  );
}
