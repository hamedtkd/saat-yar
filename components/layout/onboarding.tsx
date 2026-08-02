"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Database,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "@/components/common/brand";  
import { NumberField } from "@/components/common/number-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fa } from "@/lib/format";
import type { AppData, Mode } from "@/lib/types";
import { MinuteDurationField } from "../common/minute-duration-field";
import { cn } from "@/lib/cn";

export function Onboarding({
  data,
  setData,
  step,
  setStep,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  step: number;
  setStep: (step: number) => void;
}) {
  const setSetting = <K extends keyof AppData["settings"]>(
    key: K,
    value: AppData["settings"][K],
  ) =>
    setData((previous) => ({
      ...previous,
      settings: { ...previous.settings, [key]: value },
    }));

  const modes = [
    {
      id: "employee" as Mode,
      icon: CalendarDays,
      title: "کارمند",
      points: ["ورود و خروج", "مرخصی و اضافه‌کاری", "گزارش ماهانه"],
    },
    {
      id: "freelancer" as Mode,
      icon: BriefcaseBusiness,
      title: "فریلنسر",
      points: ["مشتری و پروژه", "تایمر قابل صورتحساب", "گزارش درآمد"],
    },
    {
      id: "hybrid" as Mode,
      icon: LayoutDashboard,
      title: "ترکیبی",
      points: ["هر دو فضای کاری", "جابجایی سریع", "گزارش‌های جداگانه"],
    },
  ];

  return (
    <div className={cn("fixed inset-0 z-[500] overflow-y-auto bg-[#fbfdfc]")}>
      <header className={cn("flex h-[88px] items-center justify-between border-b border-[#dfe7e9] px-[42px] max-[620px]:px-4")}>
        <Brand />
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-[#079b60] [&_svg]:h-[15px] [&_svg]:w-[15px] max-[620px]:hidden")}>
          <CheckCircle2 /> ذخیره خودکار
        </span>
      </header>

      <section className={cn("mx-auto my-8 max-w-[1130px] px-6 max-[620px]:mt-[18px] max-[620px]:px-[14px]")}>
        <div className={cn("mx-auto mb-[42px] grid grid-cols-4 [&>div]:relative [&>div]:grid [&>div]:place-items-center [&>div]:gap-[7px] [&>div]:text-[#6c7d89] [&>div:not(:last-child)]:after:absolute [&>div:not(:last-child)]:after:right-1/2 [&>div:not(:last-child)]:after:top-[19px] [&>div:not(:last-child)]:after:-z-[1] [&>div:not(:last-child)]:after:h-[3px] [&>div:not(:last-child)]:after:w-full [&>div:not(:last-child)]:after:bg-[#e3e9ea] [&_span]:grid [&_span]:h-10 [&_span]:w-10 [&_span]:place-items-center [&_span]:rounded-full [&_span]:border [&_span]:border-[#dfe7e9] [&_span]:bg-white [&_span]:text-[#102a3a] [&_.active]:text-[#079b60] [&_.active_span]:border-[#079b60] [&_.active_span]:bg-[#079b60] [&_.active_span]:text-white [&_.done_span]:border-[#079b60] [&_.done_span]:bg-[#079b60] [&_.done_span]:text-white max-[620px]:mb-6 max-[620px]:[&_small]:hidden")} aria-label="مراحل راه‌اندازی">
          {["خوش‌آمدید", "نوع استفاده", "برنامه کاری", "ذخیره‌سازی"].map(
            (label, index) => (
              <div
                className={
                  step === index + 1 ? "active" : step > index + 1 ? "done" : ""
                }
                key={label}
              >
                <span>
                  {step > index + 1 ? <Check /> : fa.format(index + 1)}
                </span>
                <small>{label}</small>
              </div>
            ),
          )}
        </div>

        {step === 1 && (
          <div className={cn("min-h-[520px] text-center [&_h1]:mb-[7px] [&_h1]:mt-0 [&_h1]:text-[clamp(28px,3vw,40px)] [&>p]:mb-[34px] [&>p]:mt-0 [&>p]:text-[#6c7d89] [&>label]:mx-auto [&>label]:my-[35px] [&>label]:max-w-[500px] [&>label]:text-right max-[900px]:min-h-0 max-[620px]:[&_h1]:text-[27px]")}>
            <span className={cn("mx-auto mb-5 mt-[70px] grid h-[82px] w-[82px] place-items-center rounded-3xl bg-[#edf9f4] text-[#079b60] [&_svg]:h-[46px] [&_svg]:w-[46px]")}>
              <Clock3 />
            </span>
            <h1>به ساعت‌یار خوش آمدی</h1>
            <p>
              زمان، مرخصی، پروژه و درآمدت را بدون ارسال اطلاعات به سرور مدیریت
              کن.
            </p>
            <label>
              دوست داری چه صدایت کنیم؟
              <Input
                autoFocus
                placeholder="مثلاً حامد"
                value={data.settings.name}
                onChange={(event) => setSetting("name", event.target.value)}
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className={cn("min-h-[520px] text-center [&_h1]:mb-[7px] [&_h1]:mt-0 [&_h1]:text-[clamp(28px,3vw,40px)] [&>p]:mb-[34px] [&>p]:mt-0 [&>p]:text-[#6c7d89] [&>label]:mx-auto [&>label]:my-[35px] [&>label]:max-w-[500px] [&>label]:text-right max-[900px]:min-h-0 max-[620px]:[&_h1]:text-[27px]")}>
            <h1>ساعت‌یار را برای خودت تنظیم کن</h1>
            <p>نوع استفاده را انتخاب کن؛ بعداً از تنظیمات قابل تغییر است.</p>
            <div className={cn("grid grid-cols-3 gap-[26px] max-[900px]:grid-cols-1 max-[620px]:gap-[10px] [&>button]:relative [&>button]:min-h-[330px] [&>button]:rounded-[17px] [&>button]:border [&>button]:border-[#dfe7e9] [&>button]:bg-white [&>button]:p-[30px] [&>button]:text-center [&>button]:text-[#102a3a] [&>button.selected]:border-2 [&>button.selected]:border-[#079b60] [&>button.selected]:bg-[linear-gradient(145deg,#fff_45%,#effaf5)] [&>button>i]:block [&>button>i]:text-[#657883] [&>button.selected>i]:text-[#079b60] [&>button>i_svg]:mx-auto [&>button>i_svg]:mb-[30px] [&>button>i_svg]:mt-[15px] [&>button>i_svg]:h-[66px] [&>button>i_svg]:w-[66px] [&>button>strong]:text-[22px] [&_ul]:mx-auto [&_ul]:mb-0 [&_ul]:mt-[22px] [&_ul]:grid [&_ul]:list-none [&_ul]:gap-[9px] [&_ul]:p-0 [&_ul]:text-[13px] [&_ul]:text-[#6c7d89] [&_li]:before:ml-[9px] [&_li]:before:text-[#079b60] [&_li]:before:content-['•'] max-[900px]:[&>button]:min-h-[220px] max-[620px]:[&>button]:min-h-[180px] max-[620px]:[&>button]:p-[18px] max-[620px]:[&>button>i_svg]:mx-auto max-[620px]:[&>button>i_svg]:mb-3 max-[620px]:[&>button>i_svg]:mt-[3px] max-[620px]:[&>button>i_svg]:h-[45px] max-[620px]:[&>button>i_svg]:w-[45px] max-[620px]:[&_ul]:mt-[9px] max-[620px]:[&_ul]:text-[11px]")}>
              {modes.map(({ id, icon: Icon, title, points }) => (
                <button
                  type="button"
                  className={data.settings.mode === id ? "selected" : ""}
                  key={id}
                  onClick={() => setSetting("mode", id)}
                >
                  {data.settings.mode === id && (
                    <span className={cn("absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-[#079b60] text-white")}>
                      <Check />
                    </span>
                  )}
                  <i>
                    <Icon />
                  </i>
                  <strong>{title}</strong>
                  <ul>
                    {points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={cn("min-h-[520px] text-center [&_h1]:mb-[7px] [&_h1]:mt-0 [&_h1]:text-[clamp(28px,3vw,40px)] [&>p]:mb-[34px] [&>p]:mt-0 [&>p]:text-[#6c7d89] [&>label]:mx-auto [&>label]:my-[35px] [&>label]:max-w-[500px] [&>label]:text-right max-[900px]:min-h-0 max-[620px]:[&_h1]:text-[27px]")}>
            <h1>برنامه کاری تو</h1>
            <p>اعداد اولیه را وارد کن؛ همه موارد بعداً قابل ویرایش‌اند.</p>
            <div className={cn("mb-4 grid gap-[14px]", "grid-cols-3 max-[620px]:grid-cols-1")}>
              <label>
                هدف هفتگی (ساعت)
                <NumberField
                  value={data.settings.weeklyMinutes / 60}
                  onValueChange={(value) =>
                    setSetting("weeklyMinutes", value * 60)
                  }
                />
              </label>

              <label>
                روزهای کاری
                <Select
                  value={String(data.settings.workDays)}
                  onValueChange={(value) =>
                    setSetting("workDays", Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 5, 6].map((value) => (
                      <SelectItem value={String(value)} key={value}>
                        {fa.format(value)} روز
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label>
                ناهار پیش‌فرض
                <MinuteDurationField
                  value={data.settings.lunchMinutes}
                  onValueChange={(value) =>
                    setSetting("lunchMinutes", value)
                  }
                />
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={cn("min-h-[520px] text-center [&_h1]:mb-[7px] [&_h1]:mt-0 [&_h1]:text-[clamp(28px,3vw,40px)] [&>p]:mb-[34px] [&>p]:mt-0 [&>p]:text-[#6c7d89] [&>label]:mx-auto [&>label]:my-[35px] [&>label]:max-w-[500px] [&>label]:text-right max-[900px]:min-h-0 max-[620px]:[&_h1]:text-[27px]")}>
            <span className={cn("mx-auto mb-5 mt-[70px] grid h-[82px] w-[82px] place-items-center rounded-3xl bg-[#edf9f4] text-[#079b60] [&_svg]:h-[46px] [&_svg]:w-[46px]")}>
              <ShieldCheck />
            </span>
            <h1>اطلاعات فقط روی دستگاه تو می‌ماند</h1>
            <p>
              ساعت‌یار آفلاین کار می‌کند. برای انتقال دستگاه، فایل پشتیبان بگیر.
            </p>
            <div className={cn("mx-auto my-[30px] flex max-w-[610px] items-center gap-[13px] rounded-xl border border-[#c9e9dd] bg-[#edf9f4] p-[18px] text-right [&_svg]:h-7 [&_svg]:w-7 [&_svg]:text-[#079b60] [&_div]:grid [&_span]:text-[11px] [&_span]:text-[#6c7d89]")}>
              <Database />
              <div>
                <strong>ذخیره محلی امن</strong>
                <span>داده‌های اصلی داخل IndexedDB مرورگر ذخیره می‌شوند.</span>
              </div>
            </div>
          </div>
        )}

        <footer className={cn("flex justify-between border-t border-[#dfe7e9] pt-[18px]")}>
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            قبلی
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !data.settings.name.trim()}
            >
              ادامه
            </Button>
          ) : (
            <Button onClick={() => setSetting("onboarded", true)}>
              شروع ساعت‌یار
              <Check />
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}