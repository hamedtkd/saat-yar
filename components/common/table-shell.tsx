import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SurfaceCard } from "./surface-card";

export function TableShell({ children, className }: { children: ReactNode; className?: string }) {
  return <SurfaceCard as="section" className={cn("min-w-0 overflow-hidden", className)}><div className="w-full overflow-x-auto"><table className="w-full border-collapse text-xs text-[var(--text)]">{children}</table></div></SurfaceCard>;
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("border-y border-[var(--border)] bg-[var(--surface-2)] text-start text-[var(--text-muted)] [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-3 [&_th]:font-semibold", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr]:border-b [&_tr]:border-[var(--border)] [&_tr:last-child]:border-b-0 [&_td]:px-3 [&_td]:py-3", className)} {...props} />;
}
