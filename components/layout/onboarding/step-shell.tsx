import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function StepShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "min-h-[520px] text-center [&_h1]:mb-[7px] [&_h1]:mt-0 [&_h1]:text-[clamp(28px,3vw,40px)] [&>p]:mb-[34px] [&>p]:mt-0 [&>p]:text-[var(--text-muted)] [&>label]:mx-auto [&>label]:my-[35px] [&>label]:max-w-[500px] [&>label]:text-right max-[900px]:min-h-0 max-[620px]:[&_h1]:text-[27px]",
      )}
    >
      {children}
    </div>
  );
}
