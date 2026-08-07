import { BrandMark } from "@/components/common/brand-mark";
import { cn } from "@/lib/cn";

export function Brand({ subtitle = "حساب کار، بدون حساب‌وکتاب" }: { subtitle?: string }) {
  return (
    <div className={cn("flex items-center gap-2 max-[620px]:[&_strong]:text-lg")}>
      <BrandMark size={44} label="لوگوی ساعت‌یار" />
      <div className="hidden flex-col gap-0.5 md:flex">
        <strong>ساعت‌یار</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}
