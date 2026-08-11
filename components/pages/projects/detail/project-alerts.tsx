"use client";

import { AlertBanner } from "@/components/common/alert-banner";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import type { ProjectFinanceSummary } from "@/lib/project-finance";

export function ProjectAlerts({ summary }: { summary: ProjectFinanceSummary }) {
  const { b, duration } = useBusinessUi();
  if (summary.budgetStatus === "warning") {
    return <AlertBanner className="mb-4" tone="warning" title={b("projects.alert.warning")} />;
  }
  if (summary.budgetStatus === "exceeded") {
    return <AlertBanner className="mb-4" tone="danger" title={b("projects.alert.exceeded", { duration: duration(summary.trackedMinutes - summary.budgetMinutes) })} />;
  }
  return null;
}
