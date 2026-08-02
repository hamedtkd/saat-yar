import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
export function StatusBadge({ success = false, children }: { success?: boolean; children: ReactNode }) {
  return <span className={cn("inline-flex items-center justify-center rounded-lg border border-[#d7dfe2] bg-[#f7f9f9] px-[9px] py-1 text-[10px] text-[#677984]", success && "border-[#caeade] bg-[#eff9f5] text-[#087e50]")}>{children}</span>;
}
