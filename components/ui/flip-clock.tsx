"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type FlipClockSize = "hero" | "compact";

type DigitProps = {
  value: string;
  reducedMotion: boolean;
  size: FlipClockSize;
};

function Digit({ value, reducedMotion, size }: DigitProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden",
        size === "hero" ? "h-[1.18em] w-[0.84em]" : "h-[1.1em] w-[0.76em]",
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reducedMotion ? false : { y: "-0.8em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reducedMotion ? undefined : { y: "0.8em", opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.28, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Separator({ size }: { size: FlipClockSize }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center opacity-85",
        size === "hero" ? "h-[1.18em] w-[0.38em]" : "h-[1.1em] w-[0.34em]",
      )}
    >
      :
    </span>
  );
}

function clockGroups(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor(safeSeconds / 60) % 60).padStart(2, "0");
  const remainder = String(safeSeconds % 60).padStart(2, "0");
  return [hours, minutes, remainder];
}

export function FlipClock({
  seconds,
  ariaLabel,
  size = "hero",
  className,
}: {
  seconds: number;
  ariaLabel?: string;
  size?: FlipClockSize;
  className?: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const groups = clockGroups(seconds);

  return (
    <span
      data-flip-clock="true"
      dir="ltr"
      aria-label={ariaLabel}
      className={cn(
        "saatyar-timer-countdown inline-flex max-w-full items-center justify-center whitespace-nowrap text-current",
        size === "hero" ? "text-[20px]" : "text-lg",
        className,
      )}
    >
      {groups.map((group, groupIndex) => (
        <span key={groupIndex} className="contents">
          {group.split("").map((digit, digitIndex) => (
            <Digit key={`${groupIndex}-${digitIndex}`} value={digit} reducedMotion={reducedMotion} size={size} />
          ))}
          {groupIndex < groups.length - 1 && <Separator size={size} />}
        </span>
      ))}
    </span>
  );
}

export default FlipClock;
