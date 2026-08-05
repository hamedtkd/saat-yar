import { BriefcaseBusiness, CalendarDays, Check, LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/cn";
import type { AppData, Mode } from "@/lib/types";
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
      <div className={cn("grid grid-cols-3 gap-[26px] max-[900px]:grid-cols-1 max-[620px]:gap-[10px] [&>button]:relative [&>button]:min-h-[330px] [&>button]:rounded-[17px] [&>button]:border [&>button]:border-[#dfe7e9] [&>button]:bg-white [&>button]:p-[30px] [&>button]:text-center [&>button]:text-[#102a3a] [&>button.selected]:border-2 [&>button.selected]:border-[#079b60] [&>button.selected]:bg-[linear-gradient(145deg,#fff_45%,#effaf5)] [&>button>i]:block [&>button>i]:text-[#657883] [&>button.selected>i]:text-[#079b60] [&>button>i_svg]:mx-auto [&>button>i_svg]:mb-[30px] [&>button>i_svg]:mt-[15px] [&>button>i_svg]:h-[66px] [&>button>i_svg]:w-[66px] [&>button>strong]:text-[22px] [&_ul]:mx-auto [&_ul]:mb-0 [&_ul]:mt-[22px] [&_ul]:grid [&_ul]:list-none [&_ul]:gap-[9px] [&_ul]:p-0 [&_ul]:text-[13px] [&_ul]:text-[#6c7d89] [&_li]:before:ml-[9px] [&_li]:before:text-[#079b60] [&_li]:before:content-['•'] max-[900px]:[&>button]:min-h-[220px] max-[620px]:[&>button]:min-h-[180px] max-[620px]:[&>button]:p-[18px] max-[620px]:[&>button>i_svg]:mb-3 max-[620px]:[&>button>i_svg]:mt-[3px] max-[620px]:[&>button>i_svg]:h-[45px] max-[620px]:[&>button>i_svg]:w-[45px] max-[620px]:[&_ul]:mt-[9px] max-[620px]:[&_ul]:text-[11px]")}>
        {MODES.map(({ id, icon: Icon, title, points }) => (
          <button type="button" className={settings.mode === id ? "selected" : ""} key={id} onClick={() => setSetting("mode", id)}>
            {settings.mode === id && <span className={cn("absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-[#079b60] text-white")}><Check /></span>}
            <i><Icon /></i>
            <strong>{title}</strong>
            <ul>{points.map((point) => <li key={point}>{point}</li>)}</ul>
          </button>
        ))}
      </div>
    </StepShell>
  );
}
