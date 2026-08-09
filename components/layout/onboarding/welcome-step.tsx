import { Clock3, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { SetSetting } from "./types";

export function WelcomeStep({
  settings,
  setSetting,
}: {
  settings: AppData["settings"];
  setSetting: SetSetting;
}) {
  return (
    <StepShell>
      <div className="mx-auto flex max-w-[640px] flex-col items-center pt-10 sm:pt-14">
        <span className={cn("mb-5 grid size-[74px] place-items-center rounded-[24px] border border-[color-mix(in_srgb,var(--accent)_24%,var(--border))] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[0_14px_40px_rgba(0,0,0,.08)] [&_svg]:size-10")}>
          <Clock3 />
        </span>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-[10px] font-bold text-[var(--accent-strong)]">
          <Sparkles className="size-3.5" /> راه‌اندازی کمتر از دو دقیقه
        </span>
        <h1>به ساعت‌یار خوش آمدی</h1>
        <p className="max-w-[560px]">نام، برنامه کاری، حقوق و ظاهر را همین ابتدا تنظیم کن؛ همه‌چیز روی همین دستگاه ذخیره می‌شود و بعداً هم قابل ویرایش است.</p>

        <div className="mt-2 w-full max-w-[560px] rounded-[22px] border border-[var(--dashboard-border)] bg-[linear-gradient(145deg,var(--surface-1),var(--surface-raised))] p-4 text-right shadow-[0_12px_34px_rgba(0,0,0,.06)] sm:p-5">
          <label className="grid gap-2 text-[12px] font-extrabold text-[var(--text)]">
            <span>دوست داری چه صدایت کنیم؟</span>
            <Input
              data-onboarding-name
              autoFocus
              autoComplete="name"
              placeholder="مثلاً حامد"
              value={settings.name}
              onChange={(event) => setSetting("name", event.target.value)}
              className="h-12 rounded-[14px] border-[var(--dashboard-border)] bg-[var(--surface-2)] px-4 text-sm font-bold"
            />
          </label>
          <p className="mb-0 mt-2 text-[10px] leading-5 text-[var(--text-muted)]">این نام فقط برای خوش‌آمدگویی و پروفایل محلی خودت استفاده می‌شود.</p>
        </div>
      </div>
    </StepShell>
  );
}
