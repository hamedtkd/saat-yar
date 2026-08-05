import { Database, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { StepShell } from "./step-shell";

export function PrivacyStep() {
  return (
    <StepShell>
      <span className={cn("mx-auto mb-5 mt-[70px] grid h-[82px] w-[82px] place-items-center rounded-3xl bg-[var(--accent-soft)] text-[var(--accent-strong)] [&_svg]:h-[46px] [&_svg]:w-[46px]")}><ShieldCheck /></span>
      <h1>اطلاعات فقط روی دستگاه تو می‌ماند</h1>
      <p>ساعت‌یار آفلاین کار می‌کند. برای انتقال دستگاه، فایل پشتیبان بگیر.</p>
      <div className={cn("mx-auto my-[30px] flex max-w-[610px] items-center gap-[13px] rounded-xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[var(--accent-soft)] p-[18px] text-right [&_svg]:h-7 [&_svg]:w-7 [&_svg]:text-[var(--accent-strong)] [&_div]:grid [&_span]:text-[11px] [&_span]:text-[var(--text-muted)]")}>
        <Database />
        <div><strong>ذخیره محلی امن</strong><span>داده‌های اصلی داخل IndexedDB مرورگر ذخیره می‌شوند.</span></div>
      </div>
    </StepShell>
  );
}
