"use client";

import { GripHorizontal } from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

import { cn } from "@/lib/cn";
import type { PickerPresentation } from "@/lib/pickers/responsive-presentation";

type ResponsivePickerSurfaceProps = {
  presentation: PickerPresentation;
  dialogRef: RefObject<HTMLDivElement | null>;
  anchorRef?: RefObject<HTMLDivElement | null>;
  titleId: string;
  dir: "rtl" | "ltr";
  closeLabel: string;
  onClose: () => void;
  widthClassName: string;
  children: ReactNode;
};

const POPOVER_GUTTER = 12;
const POPOVER_OFFSET = 8;

export function ResponsivePickerSurface({
  presentation,
  dialogRef,
  anchorRef,
  titleId,
  dir,
  closeLabel,
  onClose,
  widthClassName,
  children,
}: ResponsivePickerSurfaceProps) {
  const drawer = presentation === "drawer";
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({ visibility: "hidden" });

  const positionPopover = useCallback(() => {
    if (drawer) return;
    const anchor = anchorRef?.current;
    const surface = dialogRef.current;
    if (!anchor || !surface) return;
    const anchorRect = anchor.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const availableBelow = viewportHeight - anchorRect.bottom - POPOVER_OFFSET - POPOVER_GUTTER;
    const availableAbove = anchorRect.top - POPOVER_OFFSET - POPOVER_GUTTER;
    const placeAbove = availableBelow < Math.min(surfaceRect.height, 280) && availableAbove > availableBelow;
    const maxHeight = Math.max(180, placeAbove ? availableAbove : availableBelow);
    const rawLeft = dir === "rtl" ? anchorRect.right - surfaceRect.width : anchorRect.left;
    const left = Math.min(
      Math.max(POPOVER_GUTTER, rawLeft),
      Math.max(POPOVER_GUTTER, viewportWidth - surfaceRect.width - POPOVER_GUTTER),
    );
    const top = placeAbove
      ? Math.max(POPOVER_GUTTER, anchorRect.top - POPOVER_OFFSET - Math.min(surfaceRect.height, maxHeight))
      : Math.min(viewportHeight - POPOVER_GUTTER, anchorRect.bottom + POPOVER_OFFSET);
    setPopoverStyle({ position: "fixed", left, top, maxHeight, visibility: "visible" });
  }, [anchorRef, dialogRef, dir, drawer]);

  useLayoutEffect(() => {
    if (drawer) return;
    positionPopover();
    const surface = dialogRef.current;
    const observer = surface && typeof ResizeObserver !== "undefined" ? new ResizeObserver(positionPopover) : null;
    if (surface) observer?.observe(surface);
    window.addEventListener("resize", positionPopover);
    window.addEventListener("scroll", positionPopover, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", positionPopover);
      window.removeEventListener("scroll", positionPopover, true);
    };
  }, [dialogRef, drawer, positionPopover]);

  useEffect(() => {
    if (drawer) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || dialogRef.current?.contains(target) || anchorRef?.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [anchorRef, dialogRef, drawer, onClose]);

  const content = (
    <>
      {drawer && (
        <button
          type="button"
          aria-label={closeLabel}
          className="fixed inset-0 z-[1190] border-0 bg-[var(--overlay)] backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal={drawer ? "true" : "false"}
        aria-labelledby={titleId}
        tabIndex={-1}
        dir={dir}
        data-picker-presentation={presentation}
        style={drawer ? undefined : popoverStyle}
        className={cn(
          "z-[1200] border border-[var(--border)] bg-[var(--surface-1)]",
          "shadow-[0_22px_64px_rgba(0,0,0,.3)] outline-none",
          drawer
            ? "fixed inset-x-2 bottom-2 max-h-[min(88dvh,720px)] overflow-y-auto rounded-[24px] p-4 pb-[max(16px,env(safe-area-inset-bottom))] max-[359px]:inset-x-1.5 max-[359px]:bottom-1.5 max-[359px]:rounded-[20px] max-[359px]:p-3 max-[359px]:pb-[max(12px,env(safe-area-inset-bottom))]"
            : "overflow-y-auto rounded-2xl p-4",
          widthClassName,
        )}
      >
        {drawer && (
          <div aria-hidden="true" className="mb-2 flex justify-center">
            <GripHorizontal className="size-6 text-[var(--text-muted)]" />
          </div>
        )}
        {children}
      </div>
    </>
  );

  return typeof document === "undefined" ? content : createPortal(content, document.body);
}
