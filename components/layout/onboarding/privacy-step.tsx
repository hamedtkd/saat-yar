import { Database, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { StepShell } from "./step-shell";

export function PrivacyStep() {
  return (
    <StepShell>
      <span className={cn("mx-auto mb-5 mt-[70px] grid h-[82px] w-[82px] place-items-center rounded-3xl bg-[#edf9f4] text-[#079b60] [&_svg]:h-[46px] [&_svg]:w-[46px]")}><ShieldCheck /></span>
      <h1>اطلاعات فقط روی دستگاه تو می‌ماند</h1>
      <p>ساعت‌یار آفلاین کار می‌کند. برای انتقال دستگاه، فایل پشتیبان بگیر.</p>
      <div className={cn("mx-auto my-[30px] flex max-w-[610px] items-center gap-[13px] rounded-xl border border-[#c9e9dd] bg-[#edf9f4] p-[18px] text-right [&_svg]:h-7 [&_svg]:w-7 [&_svg]:text-[#079b60] [&_div]:grid [&_span]:text-[11px] [&_span]:text-[#6c7d89]")}>
        <Database />
        <div><strong>ذخیره محلی امن</strong><span>داده‌های اصلی داخل IndexedDB مرورگر ذخیره می‌شوند.</span></div>
      </div>
    </StepShell>
  );
}
