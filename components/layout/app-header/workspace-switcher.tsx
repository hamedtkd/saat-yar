import { UserRound } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";

export function WorkspaceSwitcher({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return <div className={cn("grid h-12 grid-cols-[auto_112px] items-center gap-2 rounded-xl border border-[#cfe2dc] bg-[#edf9f4] py-[5px] pl-[10px] pr-[7px]", "[&>span]:inline-flex [&>span]:items-center [&>span]:gap-[5px] [&>span]:whitespace-nowrap [&>span]:text-[10px] [&>span]:font-bold [&>span]:text-[#316153] [&>span_svg]:h-[15px] [&>span_svg]:w-[15px] [&>span_svg]:text-[#079b60]", "max-[1180px]:grid-cols-[105px] max-[1180px]:p-[5px] max-[1180px]:[&>span]:hidden max-[620px]:w-[104px] max-[620px]:grid-cols-1")}>
    <span><UserRound aria-hidden="true" />فضای کاری</span>
    <Select value={mode} onValueChange={(value) => onChange(value as Mode)}>
      <SelectTrigger aria-label="تغییر سریع فضای کاری" className="h-9 border-[#beddd2] bg-white text-[11px] font-extrabold"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="employee">کارمند</SelectItem><SelectItem value="freelancer">فریلنسر</SelectItem><SelectItem value="hybrid">ترکیبی</SelectItem></SelectContent>
    </Select>
  </div>;
}
