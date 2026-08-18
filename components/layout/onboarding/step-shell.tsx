import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StepShell({ children }: { children: ReactNode }) {
  return (
    <div className={cn("min-h-[500px] rounded-[32px] border border-[color-mix(in_srgb,var(--dashboard-border)_76%,transparent)] bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--accent)_7%,transparent),transparent_36%),linear-gradient(180deg,color-mix(in_srgb,var(--surface-1)_72%,transparent),transparent)] px-4 py-5 text-center text-[var(--text)] sm:px-8 sm:py-7 [&_h1]:mb-3 [&_h1]:mt-0 [&_h1]:text-[clamp(30px,3.4vw,48px)] [&_h1]:font-black [&_h1]:tracking-[-.035em] [&>p]:mx-auto [&>p]:mb-8 [&>p]:mt-0 [&>p]:max-w-[720px] [&>p]:text-[var(--text-muted)] max-[900px]:min-h-0 max-[620px]:rounded-[24px] [&>label]:text-start max-[620px]:px-3 max-[620px]:[&_h1]:text-[28px]")}>{children}</div>
  );
}
