import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type SurfaceCardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
};

export function SurfaceCard({
  as: Component = "section",
  className,
  ...props
}: SurfaceCardProps) {
  return (
    <Component
      className={cn(
        "rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)]",
        className,
      )}
      {...props}
    />
  );
}
