"use client";

import { BrandMark } from "@/components/common/brand-mark";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";

export function Brand({ subtitle }: { subtitle?: string }) {
  const { t } = useLocale();
  return (
    <div className={cn("flex items-center gap-2 max-[620px]:[&_strong]:text-lg")}>
      <BrandMark size={44} label={t("app.logoLabel")} />
      <div className="hidden flex-col gap-0.5 md:flex">
        <strong>{t("app.name")}</strong>
        <small>{subtitle ?? t("app.brandSubtitle")}</small>
      </div>
    </div>
  );
}
