import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
export function PageHeading({ title, description, children, autosave = true }: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  autosave?: boolean;
}) {
  return (
    <section className={cn("mb-[22px] flex min-h-24 items-start justify-between gap-6 [&>div:first-child]:min-w-0 [&_h1]:mb-0.5 [&_h1]:mt-2 [&_h1]:text-[clamp(26px,2.4vw,36px)] [&_h1]:leading-[1.35] [&_h1]:tracking-[-.9px] [&_p]:m-0 [&_p]:text-[13px] [&_p]:text-[#6c7d89] max-[620px]:mb-[17px] max-[620px]:min-h-0 max-[620px]:flex-col max-[620px]:[&>button]:w-full max-[620px]:[&>.row-actions]:w-full max-[620px]:[&_.date-popover]:w-full max-[620px]:[&_h1]:text-[25px]")}>
      <div>
        {autosave && <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-[#079b60] [&_svg]:h-[15px] [&_svg]:w-[15px]")}><CheckCircle2 /> ذخیره خودکار</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}
