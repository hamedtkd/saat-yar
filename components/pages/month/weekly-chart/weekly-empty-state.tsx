import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";

export function WeeklyEmptyState() {
  return (
    <div className="mt-4 min-h-[290px]">
      <EmptyState
        icon={<BarChart3 />}
        title="هنوز داده‌ای برای نمودار وجود ندارد"
        description="بعد از ثبت کارکرد، نمودار هفتگی اینجا نمایش داده می‌شود."
      />
    </div>
  );
}
