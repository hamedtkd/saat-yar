import Link from "next/link";
import { Settings } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";
import { getVisibleNavItems } from "../app-header/nav-items";

type Props = { mode: Mode; currentPath: string; name: string };

export function SidebarNav({ mode, currentPath, name }: Props) {
  const items = getVisibleNavItems(mode);
  return (
    <aside className="fixed inset-y-3 right-3 z-40 hidden w-[248px] flex-col rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] p-3 shadow-[0_24px_80px_rgba(0,0,0,.12)] xl:flex">
      <div className="px-2 py-2"><Brand subtitle={name ? `فضای شخصی ${name}` : "حساب کار، بدون حساب‌وکتاب"} /></div>
      <nav aria-label="ناوبری اصلی" className="mt-6 grid gap-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = currentPath === href;
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-[var(--control-radius)] px-3 text-sm font-bold text-[var(--text-muted)] transition", "hover:bg-[var(--accent-soft)] hover:text-[var(--text)]", active && "bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[inset_-3px_0_0_var(--accent)]")}>
              <span className={cn("grid size-8 place-items-center rounded-xl bg-[var(--surface-2)]", active && "bg-[var(--accent)] text-[var(--accent-foreground)]")}><Icon aria-hidden="true" /></span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[var(--border)] pt-3">
        <Link href="/settings" aria-current={currentPath === "/settings" ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-[var(--control-radius)] px-3 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]", currentPath === "/settings" && "bg-[var(--accent-soft)] text-[var(--accent-strong)]")}>
          <span className="grid size-8 place-items-center rounded-xl bg-[var(--surface-2)]"><Settings aria-hidden="true" /></span>
          تنظیمات
        </Link>
      </div>
    </aside>
  );
}
