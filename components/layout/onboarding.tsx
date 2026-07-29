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
import { tw } from "@/lib/tw";
import type { AppData, Mode } from "@/lib/types";
import { MinuteDurationField } from "../common/minute-duration-field";

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
    <div className={tw("onboarding")}>
      <header className={tw("onboarding-head")}>
        <Brand />
        <span className={tw("safe-note")}>
          <CheckCircle2 /> ذخیره خودکار
        </span>
      </header>

      <section className={tw("wizard-shell")}>
        <div className={tw("wizard-steps")} aria-label="مراحل راه‌اندازی">
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
          <div className={tw("wizard-page")}>
            <span className={tw("wizard-logo")}>
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
          <div className={tw("wizard-page")}>
            <h1>ساعت‌یار را برای خودت تنظیم کن</h1>
            <p>نوع استفاده را انتخاب کن؛ بعداً از تنظیمات قابل تغییر است.</p>
            <div className={tw("mode-grid")}>
              {modes.map(({ id, icon: Icon, title, points }) => (
                <button
                  type="button"
                  className={data.settings.mode === id ? "selected" : ""}
                  key={id}
                  onClick={() => setSetting("mode", id)}
                >
                  {data.settings.mode === id && (
                    <span className={tw("mode-check")}>
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
          <div className={tw("wizard-page")}>
            <h1>برنامه کاری تو</h1>
            <p>اعداد اولیه را وارد کن؛ همه موارد بعداً قابل ویرایش‌اند.</p>
            <div className={tw("form-grid", "three")}>
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
          <div className={tw("wizard-page")}>
            <span className={tw("wizard-logo")}>
              <ShieldCheck />
            </span>
            <h1>اطلاعات فقط روی دستگاه تو می‌ماند</h1>
            <p>
              ساعت‌یار آفلاین کار می‌کند. برای انتقال دستگاه، فایل پشتیبان بگیر.
            </p>
            <div className={tw("privacy-callout")}>
              <Database />
              <div>
                <strong>ذخیره محلی امن</strong>
                <span>داده‌های اصلی داخل IndexedDB مرورگر ذخیره می‌شوند.</span>
              </div>
            </div>
          </div>
        )}

        <footer className={tw("wizard-actions")}>
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