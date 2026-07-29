import type { ReactNode } from "react";
import { tw } from "@/lib/tw";

export function EmptyState({ icon, title, description, compact = false, large = false, children }: {
  icon: ReactNode;
  title?: string;
  description?: string;
  compact?: boolean;
  large?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={tw("empty-state", compact && "compact", large && "large")}>
      {icon}{title && <strong>{title}</strong>}{description && <span>{description}</span>}{children}
    </div>
  );
}
