"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type AlertDialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

function useAlertDialogContext() {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error("AlertDialog components must be used inside AlertDialog");
  return context;
}

function AlertDialog({ open = false, onOpenChange, children }: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return <AlertDialogContext.Provider value={{ open, setOpen: (next) => onOpenChange?.(next) }}>{children}</AlertDialogContext.Provider>;
}

function AlertDialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const { setOpen } = useAlertDialogContext();
  if (asChild) return React.cloneElement(children, { onClick: () => setOpen(true) } as React.HTMLAttributes<HTMLElement>);
  return <button type="button" onClick={() => setOpen(true)}>{children}</button>;
}

function AlertDialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useAlertDialogContext();
  const titleId = React.useId();
  const descriptionId = React.useId();
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center p-4" role="presentation">
    <button type="button" aria-label="بستن پنجره" className="absolute inset-0 bg-[color-mix(in_srgb,var(--text)_35%,transparent)] backdrop-blur-[2px]" onClick={() => setOpen(false)} />
    <div role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className={cn("relative z-10 grid w-[min(92vw,460px)] gap-4 rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] p-5 text-right shadow-[0_24px_70px_rgba(0,0,0,.22)]", className)} {...props}>
      <AlertDialogIdsContext.Provider value={{ titleId, descriptionId }}>{children}</AlertDialogIdsContext.Provider>
    </div>
  </div>;
}

const AlertDialogIdsContext = React.createContext({ titleId: "", descriptionId: "" });

function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-row-reverse flex-wrap gap-2", className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = React.useContext(AlertDialogIdsContext);
  return <h2 id={titleId} className={cn("text-base font-black text-[var(--text)]", className)} {...props} />;
}

function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = React.useContext(AlertDialogIdsContext);
  return <p id={descriptionId} className={cn("text-xs leading-6 text-[var(--text-muted)]", className)} {...props} />;
}

function AlertDialogAction({ className, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useAlertDialogContext();
  return <button type="button" className={cn(buttonVariants(), className)} onClick={(event) => { onClick?.(event); setOpen(false); }} {...props} />;
}

function AlertDialogCancel({ className, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useAlertDialogContext();
  return <button type="button" className={cn(buttonVariants({ variant: "outline" }), className)} onClick={(event) => { onClick?.(event); setOpen(false); }} {...props} />;
}

export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger };
