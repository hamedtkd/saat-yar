"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

type ViewportSnapshot = {
  offsetLeft: number;
  offsetTop: number;
  width: number;
  height: number;
  layoutWidth: number;
};

const SERVER_VIEWPORT: ViewportSnapshot = { offsetLeft: 0, offsetTop: 0, width: 0, height: 0, layoutWidth: 0 };
let lastViewportKey = "server";
let lastViewportSnapshot = SERVER_VIEWPORT;

function readViewportSnapshot(): ViewportSnapshot {
  if (typeof window === "undefined") return SERVER_VIEWPORT;
  const viewport = window.visualViewport;
  const next = {
    offsetLeft: viewport?.offsetLeft ?? 0,
    offsetTop: viewport?.offsetTop ?? 0,
    width: viewport?.width ?? window.innerWidth,
    height: viewport?.height ?? window.innerHeight,
    layoutWidth: window.innerWidth,
  };
  const key = `${next.offsetLeft}:${next.offsetTop}:${next.width}:${next.height}:${next.layoutWidth}`;
  if (key !== lastViewportKey) {
    lastViewportKey = key;
    lastViewportSnapshot = next;
  }
  return lastViewportSnapshot;
}

function subscribeViewport(onStoreChange: () => void) {
  const viewport = window.visualViewport;
  viewport?.addEventListener("resize", onStoreChange);
  viewport?.addEventListener("scroll", onStoreChange);
  window.addEventListener("resize", onStoreChange);
  window.addEventListener("scroll", onStoreChange);
  return () => {
    viewport?.removeEventListener("resize", onStoreChange);
    viewport?.removeEventListener("scroll", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
    window.removeEventListener("scroll", onStoreChange);
  };
}

function useDialogViewportStyle(direction: "ltr" | "rtl"): React.CSSProperties {
  const viewport = React.useSyncExternalStore(subscribeViewport, readViewportSnapshot, () => SERVER_VIEWPORT);
  if (!viewport.width || !viewport.height) return {};

  const gutter = 12;
  const width = Math.max(0, Math.min(520, viewport.width - gutter * 2));
  const maxHeight = Math.max(0, viewport.height - gutter * 2);
  const compact = viewport.width < 640;
  const rtlLayoutCompensation = direction === "rtl"
    ? Math.max(0, viewport.layoutWidth - viewport.width - viewport.offsetLeft)
    : 0;
  const visualCenterX = viewport.offsetLeft + rtlLayoutCompensation + viewport.width / 2;

  if (compact) {
    return {
      left: visualCenterX,
      top: viewport.offsetTop + gutter,
      width,
      maxHeight,
      transform: "translateX(-50%)",
    };
  }

  return {
    left: visualCenterX,
    top: viewport.offsetTop + viewport.height / 2,
    width,
    maxHeight,
    transform: "translate(-50%, -50%)",
  };
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--text)_35%,transparent)] backdrop-blur-[2px]",
      "data-[state=closed]:opacity-0 data-[state=open]:opacity-100 motion-safe:transition-opacity",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, style, ...props }, ref) => {
  const { direction, t } = useLocale();
  const viewportStyle = useDialogViewportStyle(direction);
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        dir={direction}
        style={{ ...viewportStyle, ...style }}
        className={cn(
          "fixed z-50 grid gap-4 overflow-y-auto",
          "rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-4 text-start text-[var(--text)] sm:p-5",
          "shadow-[0_24px_70px_rgba(0,0,0,.22)] outline-none",
          "data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100",
          "motion-safe:transition-[opacity,scale]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute end-3 top-3 grid size-9 place-items-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
          aria-label={t("common.close")}
        >
          <X aria-hidden="true" className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1.5 pe-10", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)} {...props} />;
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-base font-black text-[var(--text)]", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-xs leading-6 text-[var(--text-muted)]", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
