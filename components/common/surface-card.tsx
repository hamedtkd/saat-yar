import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function SurfaceCard({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)]",
        className,
      )}
      {...props}
    />
  );
}
