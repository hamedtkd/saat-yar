"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TooltipPosition = { left: number; top: number; ready: boolean };

export function ActivityHeatmapTooltip({ id, target, content }: { id: string; target: HTMLElement | null; content: string }) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<TooltipPosition>({ left: 0, top: 0, ready: false });

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
        const gutter = 10;
        const edge = 12;
        const preferredLeft = anchor.left + anchor.width / 2 - tooltipRect.width / 2;
        const left = Math.min(Math.max(preferredLeft, edge), Math.max(edge, window.innerWidth - tooltipRect.width - edge));
        const fitsAbove = anchor.top >= tooltipRect.height + gutter + edge;
        const preferredTop = fitsAbove ? anchor.top - tooltipRect.height - gutter : anchor.bottom + gutter;
        const top = Math.min(Math.max(preferredTop, edge), Math.max(edge, window.innerHeight - tooltipRect.height - edge));
        setPosition({ left, top, ready: true });
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
  }, [content, target]);

  if (!target || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={tooltipRef}
      id={id}
      role="tooltip"
      data-activity-tooltip
      className="pointer-events-none fixed z-[2200] w-max max-w-[min(220px,calc(100vw-24px))] rounded-lg border border-[var(--dashboard-border)] bg-[var(--surface-glass)] px-2.5 py-2 text-start text-[9px] font-semibold leading-5 text-[var(--text)] shadow-[0_16px_42px_rgba(0,0,0,.28)] backdrop-blur-xl"
      style={{ left: position.left, top: position.top, visibility: position.ready ? "visible" : "hidden" }}
    >
      {content}
    </div>,
    document.body,
  );
}
