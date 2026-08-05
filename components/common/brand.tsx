import { cn } from "@/lib/cn";
import Image from "next/image";
export function Brand({
  subtitle = "حساب کار، بدون حساب‌وکتاب",
}: {
  subtitle?: string;
}) {
  return (
    <div className={cn("max-[620px]:[&_strong]:text-lg flex items-center gap-2")}>
      <span>
        <Image
          height={44}
          width={44}
          src="/saatyar-logo-green.svg"
          alt="ساعت‌یار"
        />
      </span>
      <div className='md:flex flex-col gap-0.5 hidden '>
        <strong>ساعت‌یار</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}
