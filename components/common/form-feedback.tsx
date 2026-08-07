import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return <span id={id} className="text-[10px] font-semibold text-[var(--danger)]">{message}</span>;
}

export function FormFeedback({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return (
    <div role="alert" aria-live="polite" className={cn("flex items-start gap-2 rounded-[var(--control-radius)] border border-[color-mix(in_srgb,var(--danger)_32%,var(--border))] bg-[var(--danger-soft)] px-3 py-2.5 text-[11px] font-semibold text-[var(--danger)]", className)}>
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
