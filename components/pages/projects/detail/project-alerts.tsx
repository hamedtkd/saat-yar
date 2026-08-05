import { AlertBanner } from "@/components/common/alert-banner";
import { duration } from "@/lib/format";
import type { ProjectFinanceSummary } from "@/lib/project-finance";

export function ProjectAlerts({ summary }: { summary: ProjectFinanceSummary }) {
  if (summary.budgetStatus === "warning") {
    return <AlertBanner className="mb-4" tone="warning" title="بیش از ۸۰٪ بودجه زمانی پروژه مصرف شده است." />;
  }
  if (summary.budgetStatus === "exceeded") {
    return <AlertBanner className="mb-4" tone="danger" title={`بودجه زمانی پروژه تمام شده و ${duration(summary.trackedMinutes - summary.budgetMinutes)} بیشتر از بودجه ثبت شده است.`} />;
  }
  return null;
}
