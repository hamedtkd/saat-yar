"use client";

import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";

export function WeeklyEmptyState() {
  const { t } = useLocaleUi();
  return <div className="mt-4 min-h-[290px]"><EmptyState icon={<BarChart3 />} title={t("month.weekly.empty")} description={t("month.weekly.emptyHint")} /></div>;
}
