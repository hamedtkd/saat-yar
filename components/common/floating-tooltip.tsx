"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { getFloatingTooltipPosition } from "@/lib/floating-tooltip";

type Position = { left: number; top: number; side: "top" | "bottom"; ready: boolean };

export function FloatingTooltip({
  id,
  target,
  children,
  className,
  activity = false,
}: {
  id?: string;
  target: HTMLElement | null;
  children: ReactNode;
  className?: string;
  activity?: boolean;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ left: 0, top: 0, side: "top", ready: false });

  useLayoutEffect(() => {
    if (!target) return;
    const targetElement = target;
    let frame = 0;

    function updatePosition() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;
        const anchor = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const next = getFloatingTooltipPosition(anchor, tooltipRect, { width: window.innerWidth, height: window.innerHeight });
        setPosition({ ...next, ready: true });
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [children, target]);

  if (!target || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={tooltipRef}
      id={id}
      role="tooltip"
      data-floating-tooltip
      data-activity-tooltip={activity ? "" : undefined}
      data-side={position.side}
      className={cn(
        "pointer-events-none fixed z-[2200] w-fit min-w-0 max-w-[min(260px,calc(100vw-24px))] overflow-hidden rounded-lg border border-[var(--dashboard-border)] bg-[var(--surface-glass)] px-2.5 py-2 text-start text-[10px] font-semibold leading-5 text-[var(--text)] shadow-[0_16px_42px_rgba(0,0,0,.24)] backdrop-blur-xl [overflow-wrap:anywhere]",
        className,
      )}
      style={{ left: position.left, top: position.top, visibility: position.ready ? "visible" : "hidden" }}
    >
      {children}
    </div>,
    document.body,
  );
}
