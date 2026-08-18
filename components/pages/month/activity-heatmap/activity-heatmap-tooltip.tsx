"use client";

import { FloatingTooltip } from "@/components/common/floating-tooltip";

export function ActivityHeatmapTooltip({ id, target, content }: { id: string; target: HTMLElement | null; content: string }) {
  return <FloatingTooltip id={id} target={target} className="max-w-[min(220px,calc(100vw-24px))] text-[9px]">{content}</FloatingTooltip>;
}
