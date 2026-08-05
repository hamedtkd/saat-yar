import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { NumberField } from "@/components/common/number-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { fa } from "@/lib/format";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { SetSetting } from "./types";

export function ScheduleStep({ settings, setSetting }: { settings: AppData["settings"]; setSetting: SetSetting }) {
  return (
    <StepShell>
      <h1>برنامه کاری تو</h1>
      <p>اعداد اولیه را وارد کن؛ همه موارد بعداً قابل ویرایش‌اند.</p>
      <div className={cn("mb-4 grid grid-cols-3 gap-[14px] max-[620px]:grid-cols-1")}>
        <label>هدف هفتگی (ساعت)<NumberField value={settings.weeklyMinutes / 60} onValueChange={(value) => setSetting("weeklyMinutes", value * 60)} /></label>
        <label>
          روزهای کاری
          <Select value={String(settings.workDays)} onValueChange={(value) => setSetting("workDays", Number(value))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[4, 5, 6].map((value) => <SelectItem value={String(value)} key={value}>{fa.format(value)} روز</SelectItem>)}</SelectContent>
          </Select>
        </label>
        <label>ناهار پیش‌فرض<MinuteDurationField value={settings.lunchMinutes} onValueChange={(value) => setSetting("lunchMinutes", value)} /></label>
      </div>
    </StepShell>
  );
}
