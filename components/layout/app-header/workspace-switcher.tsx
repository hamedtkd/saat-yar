import { BriefcaseBusiness } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Mode } from "@/lib/types";

export function WorkspaceSwitcher({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="flex h-10 min-w-0 items-center gap-1.5 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-1)] px-1.5 max-[520px]:h-9 max-[520px]:gap-0 max-[520px]:px-1">
      <BriefcaseBusiness aria-hidden="true" className="size-4 shrink-0 text-[var(--accent-strong)] max-[420px]:hidden" />
      <Select value={mode} onValueChange={(value) => onChange(value as Mode)}>
        <SelectTrigger aria-label="تغییر سریع فضای کاری" className="h-8 min-w-[96px] border-0 bg-transparent px-1.5 text-xs font-extrabold shadow-none focus:ring-0 data-[state=open]:ring-0 max-[520px]:min-w-[76px] max-[520px]:px-1 max-[520px]:text-[10px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-[240px]">
          <div className="mx-1 mb-1 grid gap-1 rounded-lg bg-[var(--surface-2)] px-2.5 py-2 text-[9px] leading-5 text-[var(--text-muted)]">
            <span><b className="text-[var(--text)]">کارمند:</b> حضور، مرخصی و حقوق</span>
            <span><b className="text-[var(--text)]">فریلنسر:</b> مشتری، پروژه و فاکتور</span>
            <span><b className="text-[var(--text)]">ترکیبی:</b> هر دو فضای کاری</span>
          </div>
          <SelectGroup>
            <SelectLabel>فضای کاری · بخش‌های قابل دسترس را تغییر می‌دهد</SelectLabel>
            <SelectItem value="employee">کارمند</SelectItem>
            <SelectItem value="freelancer">فریلنسر</SelectItem>
            <SelectItem value="hybrid">ترکیبی</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
