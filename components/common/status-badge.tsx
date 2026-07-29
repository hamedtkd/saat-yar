import type { ReactNode } from "react";
import { tw } from "@/lib/tw";

export function StatusBadge({ success = false, children }: { success?: boolean; children: ReactNode }) {
  return <span className={tw("status", success && "success")}>{children}</span>;
}
