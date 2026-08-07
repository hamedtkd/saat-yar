"use client";

import { ArrowLeft, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";

const destinations = [
  { label: "پروفایل و نام نمایشی", section: "settings-profile", group: "عمومی", keywords: "نام پروفایل حساب کاربر خوشامدگویی" },
  { label: "ظاهر، تم و رنگ‌بندی", section: "settings-appearance", group: "عمومی", keywords: "تم دارک روشن رنگ ظاهر پوسته" },
  { label: "رفتار ذخیره تنظیمات", section: "settings-behavior", group: "عمومی", keywords: "ذخیره خودکار autosave draft" },
  { label: "سلامت داده و چند تب", section: "settings-health", group: "داده", keywords: "سلامت تعارض تب sync همگام سازی" },
  { label: "سطل بازیابی رکوردها", section: "settings-recycle", group: "داده", keywords: "حذف بازیابی recycle رکورد" },
  { label: "فضای ذخیره‌سازی و Recovery", section: "settings-storage", group: "داده", keywords: "storage recovery بازیابی فضا" },
  { label: "پشتیبان و واردکردن فایل", section: "settings-backup", group: "داده", keywords: "backup پشتیبان خروجی import restore" },
  { label: "انتقال موبایل و لپ‌تاپ", section: "settings-device-transfer", group: "داده", keywords: "qr webrtc انتقال دستگاه موبایل لپ تاپ sync" },
  { label: "برنامه کاری و هدف هفتگی", section: "settings-work-schedule", group: "کار و حقوق", keywords: "ساعت شروع پایان هدف برنامه کار" },
  { label: "تعطیلات و استثناها", section: "settings-holidays", group: "کار و حقوق", keywords: "تعطیل holiday تقویم استثنا" },
  { label: "روش محاسبه حقوق", section: "settings-payroll", group: "کار و حقوق", keywords: "حقوق payroll ماهانه ساعتی روزکاری اضافه کاری کسر کار" },
  { label: "مزایا و کسورات حقوق", section: "settings-payroll-components", group: "کار و حقوق", keywords: "مزایا کسورات پاداش مالی حقوق" },
  { label: "اعلان‌ها و یادآورها", section: "settings-notifications", group: "کار و حقوق", keywords: "اعلان notification یادآور وقفه پایان کار" },
  { label: "بازنشانی و عملیات حساس", section: "settings-danger", group: "ایمنی", keywords: "حذف reset بازنشانی خطر حساس" },
] as const;

export function SettingsSearch() {
  const [query, setQuery] = useState("");
  const { requestNavigation } = useUnsavedNavigation();
  const normalized = query.trim().toLocaleLowerCase("fa-IR");
  const results = useMemo(() => {
    if (!normalized) return [];
    return destinations.filter((item) => `${item.label} ${item.group} ${item.keywords}`.toLocaleLowerCase("fa-IR").includes(normalized)).slice(0, 7);
  }, [normalized]);

  const goTo = (section: string) => {
    requestNavigation(() => {
      window.history.replaceState(null, "", `#${section}`);
      window.dispatchEvent(new Event("hashchange"));
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setQuery("");
    });
  };

  return (
    <section className="dashboard-card relative z-20 mb-5 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-3 shadow-[0_5px_16px_rgba(0,0,0,.025)] sm:p-4">
      <div className="flex items-center gap-3 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
        <Search aria-hidden="true" className="size-4.5 shrink-0 text-[var(--accent-strong)]" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جستجو در تنظیمات؛ مثلاً حقوق، QR یا ظاهر…"
          aria-label="جستجو در تنظیمات"
          className="h-11 min-w-0 flex-1 bg-transparent text-xs font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
        />
        {query && (
          <button type="button" aria-label="پاک کردن جستجو" onClick={() => setQuery("")} className="grid size-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]">
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>

      {normalized && (
        <div className="absolute left-3 right-3 top-[calc(100%-6px)] z-30 rounded-[16px] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] p-2 shadow-[0_18px_48px_rgba(0,0,0,.16)] backdrop-blur-2xl sm:left-4 sm:right-4">
          {results.length > 0 ? (
            <div className="grid gap-1">
              {results.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => goTo(item.section)}
                  className="group flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-right transition-colors hover:bg-[var(--accent-soft)]"
                >
                  <span className="grid gap-0.5">
                    <strong className="text-[11px] text-[var(--text)] group-hover:text-[var(--accent-strong)]">{item.label}</strong>
                    <small className="text-[9px] font-semibold text-[var(--text-muted)]">{item.group}</small>
                  </span>
                  <ArrowLeft aria-hidden="true" className="size-4 text-[var(--text-muted)] group-hover:text-[var(--accent-strong)]" />
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-4 text-center text-[11px] font-semibold text-[var(--text-muted)]">نتیجه‌ای پیدا نشد؛ واژه کوتاه‌تری امتحان کن.</p>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1 text-[9px] text-[var(--text-muted)]">
        <span>دسترسی سریع:</span>
        {["حقوق", "QR", "ظاهر", "پشتیبان"].map((item) => (
          <button key={item} type="button" onClick={() => setQuery(item)} className={cn("rounded-full bg-[var(--surface-2)] px-2 py-1 font-bold hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]")}>{item}</button>
        ))}
      </div>
    </section>
  );
}
