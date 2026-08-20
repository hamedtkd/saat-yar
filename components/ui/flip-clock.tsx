"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { flipClockBoxClass, flipClockSeamClass } from "./flip-clock-surface";

type FlipClockSize = "hero" | "compact" | "project" | "activity";
type FlipClockVariant = "plain" | "boxed";

type DigitProps = {
  value: string;
  displayValue: string;
  reducedMotion: boolean;
  size: FlipClockSize;
  variant: FlipClockVariant;
};

function Digit({ value, displayValue, reducedMotion, size, variant }: DigitProps) {
  const boxed = variant === "boxed";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden",
        boxed ? flipClockBoxClass : "",
        size === "hero" && (boxed ? "h-16 w-11 sm:h-[72px] sm:w-12" : "h-[1.18em] w-[0.84em]"),
        size === "compact" && (boxed ? "h-12 w-8" : "h-[1.1em] w-[0.76em]"),
        size === "activity" && (boxed ? "h-11 w-8 max-[359px]:h-10 max-[359px]:w-7 sm:h-12 sm:w-9" : "h-[1.08em] w-[0.72em]"),
        size === "project" && (boxed ? "h-[58px] w-10 max-[359px]:h-12 max-[359px]:w-[30px] sm:h-16 sm:w-11" : "h-[1.12em] w-[0.8em]"),
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
          {displayValue}
        </motion.span>
      </AnimatePresence>
      {boxed && <span aria-hidden="true" className={flipClockSeamClass} />}
    </span>
  );
}

function Separator({ size, boxed }: { size: FlipClockSize; boxed: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center opacity-80",
        boxed ? (size === "activity" ? "h-11 text-[var(--accent-strong)] max-[359px]:h-10 sm:h-12" : "pt-4 text-[var(--accent-strong)] max-[359px]:pt-3 sm:pt-5") : "",
        size === "hero" ? "h-[1.18em] w-[0.38em]" : size === "project" ? "w-3 max-[359px]:w-2 sm:w-4" : size === "activity" ? "w-2.5 max-[359px]:w-2" : "h-[1.1em] w-[0.34em]",
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
  return [hours, minutes, remainder] as const;
}

export function FlipClock({
  seconds,
  ariaLabel,
  size = "hero",
  variant = "plain",
  className,
  unitLabels,
  formatDigit,
}: {
  seconds: number;
  ariaLabel?: string;
  size?: FlipClockSize;
  variant?: FlipClockVariant;
  className?: string;
  unitLabels?: readonly [string, string, string];
  formatDigit?: (digit: string) => string;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const groups = clockGroups(seconds);
  const boxed = variant === "boxed";

  return (
    <span
      data-flip-clock="true"
      data-flip-clock-variant={variant}
      dir="ltr"
      aria-label={ariaLabel}
      className={cn(
        "saatyar-timer-countdown inline-flex max-w-full items-start justify-center whitespace-nowrap text-current",
        size === "hero" ? "text-[20px]" : size === "project" ? "text-[2rem] font-black leading-none max-[359px]:text-[1.55rem] sm:text-[2.25rem]" : size === "activity" ? "text-[1.35rem] font-black leading-none max-[359px]:text-[1.15rem] sm:text-[1.5rem]" : "text-lg",
        boxed && (size === "activity" ? "gap-0.5 sm:gap-1" : "gap-1 max-[359px]:gap-0.5 sm:gap-2"),
        className,
      )}
    >
      {groups.map((group, groupIndex) => (
        <span key={groupIndex} className="contents">
          <span className={cn(boxed ? "grid justify-items-center gap-1.5" : "contents")}>
            <span className={cn(boxed ? (size === "activity" ? "inline-flex gap-0.5" : "inline-flex gap-1 max-[359px]:gap-0.5") : "contents")}>
              {group.split("").map((digit, digitIndex) => (
                <Digit
                  key={`${groupIndex}-${digitIndex}`}
                  value={digit}
                  displayValue={formatDigit ? formatDigit(digit) : digit}
                  reducedMotion={reducedMotion}
                  size={size}
                  variant={variant}
                />
              ))}
            </span>
            {boxed && unitLabels && (
              <small className="text-[8px] font-extrabold text-[var(--text-muted)] max-[359px]:text-[7px] sm:text-[9px]">{unitLabels[groupIndex]}</small>
            )}
          </span>
          {groupIndex < groups.length - 1 && <Separator size={size} boxed={boxed} />}
        </span>
      ))}
    </span>
  );
}

export default FlipClock;
