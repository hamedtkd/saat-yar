import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type BrandMarkProps = {
  className?: string;
  size?: number;
  animated?: boolean;
  label?: string;
};

const maskStyle: CSSProperties = {
  backgroundColor: "var(--accent)",
  WebkitMaskImage: "url('/brand/saatyar-mark.svg')",
  maskImage: "url('/brand/saatyar-mark.svg')",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
};

export function BrandMark({ className, size = 44, animated = true, label }: BrandMarkProps) {
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="absolute inset-[8%] rounded-full bg-[var(--accent)]/15 blur-[9px]" />
      <span
        className={cn(
          "relative block size-full transition-transform duration-300 hover:scale-[1.045]",
          animated && "motion-safe:animate-[saatyar-breathe_3.2s_ease-in-out_infinite]",
        )}
        style={maskStyle}
      />
    </span>
  );
}
