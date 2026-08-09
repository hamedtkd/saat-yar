"use client";

import { RotateCcw, Route } from "lucide-react";
import { useRouter } from "next/navigation";

import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";

export function OnboardingReentryCard({ startOnboardingReentry }: { startOnboardingReentry: () => void }) {
  const router = useRouter();

  const reopen = () => {
    startOnboardingReentry();
    router.push("/onboarding");
  };

  return (
    <section id="settings-onboarding" className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5">
      <PanelHead icon={<Route />} title="راه‌اندازی اولیه">
        <Button type="button" variant="outline" size="sm" onClick={reopen} data-onboarding-reentry-action="true">
          <RotateCcw aria-hidden="true" />
          اجرای دوباره راه‌اندازی
        </Button>
      </PanelHead>

      <div className="grid gap-3 rounded-[16px] bg-[var(--surface-2)] p-4 text-[10px] leading-6 text-[var(--text-muted)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <p className="m-0">
          برای مرور دوباره نام، نوع استفاده، برنامه کاری و توضیحات ذخیره‌سازی وارد Wizard شو. پروژه‌ها، رکوردهای زمانی، مرخصی‌ها و داده‌های مالی حذف یا بازنشانی نمی‌شوند.
        </p>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 font-semibold text-[var(--text)]">
          ادامه مرحله نیمه‌تمام فعال است
        </span>
      </div>
      <p className="mt-3 text-[10px] leading-5 text-[var(--text-muted)]">
        تغییرات Wizard مانند سایر تنظیمات روی همین دستگاه ذخیره می‌شوند. اگر وسط کار مرورگر بسته شود، دفعه بعد از همان مرحله ادامه می‌دهی.
      </p>
    </section>
  );
}
