import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";
import { getVisibleNavItems } from "./nav-items";

export function HeaderNav({ mode, currentPath }: { mode: Mode; currentPath: string }) {
  return (
    <nav className={cn(
      "flex h-[71px] justify-center gap-5 max-[1180px]:gap-[5px]",
      "max-[900px]:fixed max-[900px]:inset-x-[7px] max-[900px]:bottom-[calc(7px+env(safe-area-inset-bottom))] max-[900px]:z-50 max-[900px]:h-16 max-[900px]:justify-around max-[900px]:rounded-[15px] max-[900px]:border max-[900px]:border-[var(--border)] max-[900px]:bg-[var(--surface-glass)] max-[900px]:p-1 max-[900px]:shadow-[0_-8px_30px_rgba(17,45,55,0.08)] max-[900px]:backdrop-blur-xl",
      "[&_a]:relative [&_a]:inline-flex [&_a]:min-w-[86px] [&_a]:items-center [&_a]:justify-center [&_a]:gap-2 [&_a]:font-bold [&_a]:text-[var(--text)] [&_a]:transition-colors",
      "[&_a_svg]:h-5 [&_a_svg]:w-5 [&_a_svg]:shrink-0 [&_a_svg]:stroke-[1.8] [&_a.active]:text-[var(--accent-strong)]",
      "[&_a]:after:absolute [&_a]:after:inset-x-3 [&_a]:after:bottom-0 [&_a]:after:h-[3px] [&_a]:after:rounded-t-lg [&_a]:after:bg-transparent [&_a]:after:content-[''] [&_a.active]:after:bg-[var(--accent)]",
      "max-[1180px]:[&_a]:min-w-[72px] max-[900px]:[&_a]:min-w-[55px] max-[900px]:[&_a]:flex-1 max-[900px]:[&_a]:flex-col max-[900px]:[&_a]:gap-[3px] max-[900px]:[&_a]:rounded-xl max-[900px]:[&_a]:px-1 max-[900px]:[&_a]:py-1 max-[900px]:[&_a]:text-[9px] max-[900px]:[&_a]:leading-none max-[900px]:[&_a_svg]:h-[21px] max-[900px]:[&_a_svg]:w-[21px] max-[900px]:[&_a]:after:bottom-[-4px]"
    )} aria-label="ناوبری اصلی">
      {getVisibleNavItems(mode).map(({ label, icon: Icon, href }) => {
        const active = currentPath === href;
        return <Link key={href} href={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}><Icon aria-hidden="true" /><span>{label}</span></Link>;
      })}
    </nav>
  );
}
