"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent, type UIEvent } from "react";

import { cn } from "@/lib/cn";
import { formatLocaleDigits } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/locales";
import { WHEEL_ITEM_HEIGHT, wheelIndexFromScroll, wheelScrollTopFromPointerDrag } from "@/lib/pickers/wheel";

type Props = {
  locale: Locale;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

type MouseDrag = {
  pointerId: number;
  startY: number;
  startScrollTop: number;
  moved: boolean;
} | null;

export function TimeWheel({ locale, label, value, options, onChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseDrag = useRef<MouseDrag>(null);
  const suppressClick = useRef(false);
  const selectedIndex = Math.max(0, options.indexOf(value));

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || mouseDrag.current) return;
    const target = selectedIndex * WHEEL_ITEM_HEIGHT;
    if (Math.abs(node.scrollTop - target) > 1) node.scrollTo({ top: target, behavior: "auto" });
  }, [selectedIndex]);

  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
  }, []);

  const commitFromScroll = (node: HTMLDivElement, smooth = true) => {
    const index = wheelIndexFromScroll(node.scrollTop, options.length);
    const next = options[index];
    if (next && next !== value) onChange(next);
    node.scrollTo({ top: index * WHEEL_ITEM_HEIGHT, behavior: smooth ? "smooth" : "auto" });
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (mouseDrag.current) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    const node = event.currentTarget;
    settleTimer.current = setTimeout(() => commitFromScroll(node), 90);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    const node = event.currentTarget;
    mouseDrag.current = { pointerId: event.pointerId, startY: event.clientY, startScrollTop: node.scrollTop, moved: false };
    suppressClick.current = false;
    node.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = mouseDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientY - drag.startY;
    if (Math.abs(delta) > 3) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.scrollTop = wheelScrollTopFromPointerDrag(drag.startScrollTop, drag.startY, event.clientY);
  };

  const finishPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = mouseDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClick.current = drag.moved;
    mouseDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.moved) commitFromScroll(event.currentTarget);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = selectedIndex;
    if (event.key === "ArrowUp") nextIndex -= 1;
    if (event.key === "ArrowDown") nextIndex += 1;
    if (event.key === "PageUp") nextIndex -= 5;
    if (event.key === "PageDown") nextIndex += 5;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = options.length - 1;
    nextIndex = Math.min(options.length - 1, Math.max(0, nextIndex));
    const next = options[nextIndex];
    if (next) onChange(next);
  };

  return (
    <div className="relative min-w-0 flex-1" dir="ltr">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-1 top-1/2 z-10 h-11 -translate-y-1/2 rounded-xl max-[359px]:h-10 max-[359px]:rounded-[10px] border border-[color-mix(in_srgb,var(--accent)_34%,var(--border))] bg-[var(--accent-soft)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_8%,transparent)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 rounded-2xl bg-[linear-gradient(180deg,var(--surface-1)_0%,transparent_28%,transparent_72%,var(--surface-1)_100%)]" />
      <div
        ref={scrollRef}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${label.replace(/\s+/g, "-")}-${value}`}
        tabIndex={0}
        data-time-wheel
        className={cn(
          "relative z-0 h-[220px] cursor-grab snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-2xl px-1 py-[88px] select-none active:cursor-grabbing [touch-action:pan-y] max-[359px]:h-[196px] max-[359px]:rounded-xl max-[359px]:py-[76px]",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
        )}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={finishPointerDrag}
        onClickCapture={(event) => {
          if (!suppressClick.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }}
        onTouchStart={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              id={`${label.replace(/\s+/g, "-")}-${option}`}
              key={option}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={-1}
              className={cn(
                "flex h-11 w-full snap-center items-center justify-center rounded-xl text-lg font-bold max-[359px]:h-10 max-[359px]:rounded-[10px] max-[359px]:text-base tabular-nums transition-[color,opacity,transform]",
                selected ? "scale-105 text-[var(--accent-strong)]" : "text-[var(--text-muted)] opacity-70 hover:opacity-100",
              )}
              onClick={() => onChange(option)}
            >
              {formatLocaleDigits(locale, option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
