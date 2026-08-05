import { Clock3 } from "lucide-react";

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
      <span className={cn("mx-auto mb-5 mt-[70px] grid h-[82px] w-[82px] place-items-center rounded-3xl bg-[var(--accent-soft)] text-[var(--accent-strong)] [&_svg]:h-[46px] [&_svg]:w-[46px]")}>
        <Clock3 />
      </span>
      <h1>به ساعت‌یار خوش آمدی</h1>
      <p>زمان، مرخصی، پروژه و درآمدت را بدون ارسال اطلاعات به سرور مدیریت کن.</p>
      <label>
        دوست داری چه صدایت کنیم؟
        <Input
          autoFocus
          placeholder="مثلاً حامد"
          value={settings.name}
          onChange={(event) => setSetting("name", event.target.value)}
        />
      </label>
    </StepShell>
  );
}
