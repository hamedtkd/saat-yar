import { BriefcaseBusiness } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Mode } from "@/lib/types";
export function WorkspaceSwitcher({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return <div className="flex h-11 items-center gap-2 rounded-[var(--control-radius)] bg-[var(--surface-2)] px-1.5 max-[640px]:hidden">
    <BriefcaseBusiness aria-hidden="true" className="size-4 text-[var(--accent-strong)]" />
    <Select value={mode} onValueChange={(value) => onChange(value as Mode)}>
      <SelectTrigger aria-label="تغییر سریع فضای کاری" className="h-8 min-w-[104px] border-0 bg-transparent px-2 text-xs font-extrabold shadow-none focus:ring-0 data-[state=open]:ring-0"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="employee">کارمند</SelectItem><SelectItem value="freelancer">فریلنسر</SelectItem><SelectItem value="hybrid">ترکیبی</SelectItem></SelectContent>
    </Select>
  </div>;
}
