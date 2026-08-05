import { BriefcaseBusiness, CalendarDays, LayoutDashboard } from "lucide-react";

import type { AppData, Mode } from "@/lib/types";
import { ModeOption } from "./mode-option";
import { StepShell } from "./step-shell";
import type { SetSetting } from "./types";

const MODES = [
  { id: "employee" as Mode, icon: CalendarDays, title: "کارمند", points: ["ورود و خروج", "مرخصی و اضافه‌کاری", "گزارش ماهانه"] },
  { id: "freelancer" as Mode, icon: BriefcaseBusiness, title: "فریلنسر", points: ["مشتری و پروژه", "تایمر قابل صورتحساب", "گزارش درآمد"] },
  { id: "hybrid" as Mode, icon: LayoutDashboard, title: "ترکیبی", points: ["هر دو فضای کاری", "جابجایی سریع", "گزارش‌های جداگانه"] },
];

export function ModeStep({ settings, setSetting }: { settings: AppData["settings"]; setSetting: SetSetting }) {
  return (
    <StepShell>
      <h1>ساعت‌یار را برای خودت تنظیم کن</h1>
      <p>نوع استفاده را انتخاب کن؛ بعداً از تنظیمات قابل تغییر است.</p>
      <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1 max-[620px]:gap-3">
        {MODES.map((mode) => (
          <ModeOption
            key={mode.id}
            {...mode}
            selected={settings.mode === mode.id}
            onSelect={(id) => setSetting("mode", id)}
          />
        ))}
      </div>
    </StepShell>
  );
}
