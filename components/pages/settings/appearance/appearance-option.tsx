import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function AppearanceOption({ active, label, children, onClick, className }: { active: boolean; label: string; children?: React.ReactNode; onClick: () => void; className?: string }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={cn("relative min-h-11 rounded-[var(--control-radius)] border px-3 text-sm font-bold transition-colors", active ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)] ring-2 ring-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--surface-1)]", className)}>{children ?? label}{active && <Check className="absolute left-2 top-2 size-3.5" />}<span className={children ? "mt-1 block text-[11px]" : "sr-only"}>{label}</span></button>;
}
