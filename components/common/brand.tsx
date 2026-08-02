import { Clock3 } from "lucide-react";
import { cn } from "@/lib/cn";
export function Brand({ subtitle = "حساب کار، بدون حساب‌وکتاب" }: { subtitle?: string }) {
  return (
    <div className={cn("flex items-center gap-[11px] [&>span]:grid [&>span]:h-11 [&>span]:w-11 [&>span]:place-items-center [&>span]:rounded-full [&>span]:border-[3px] [&>span]:border-[#079b60] [&>span]:text-[#079b60] [&>span_svg]:h-[25px] [&>span_svg]:w-[25px] [&>div]:grid [&>div]:leading-tight [&_strong]:text-[23px] [&_strong]:tracking-[-.6px] [&_small]:mt-1 [&_small]:text-[10px] [&_small]:text-[#6c7d89] max-[900px]:[&_small]:hidden max-[620px]:[&>span]:h-9 max-[620px]:[&>span]:w-9 max-[620px]:[&>span_svg]:h-5 max-[620px]:[&>span_svg]:w-5 max-[620px]:[&_strong]:text-lg")}>
      <span><Clock3 /></span>
      <div><strong>ساعت‌یار</strong><small>{subtitle}</small></div>
    </div>
  );
}
