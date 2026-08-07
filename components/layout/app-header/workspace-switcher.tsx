import { BriefcaseBusiness } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Mode } from "@/lib/types";

export function WorkspaceSwitcher({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="flex h-10 min-w-0 items-center gap-1.5 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-1)] px-1.5 max-[520px]:h-9 max-[520px]:gap-0 max-[520px]:px-1">
      <BriefcaseBusiness aria-hidden="true" className="size-4 shrink-0 text-[var(--accent-strong)] max-[420px]:hidden" />
      <Select value={mode} onValueChange={(value) => onChange(value as Mode)}>
        <SelectTrigger aria-label="تغییر سریع فضای کاری" className="h-8 min-w-[96px] border-0 bg-transparent px-1.5 text-xs font-extrabold shadow-none focus:ring-0 data-[state=open]:ring-0 max-[520px]:min-w-[76px] max-[520px]:px-1 max-[520px]:text-[10px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="employee">کارمند</SelectItem>
          <SelectItem value="freelancer">فریلنسر</SelectItem>
          <SelectItem value="hybrid">ترکیبی</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
