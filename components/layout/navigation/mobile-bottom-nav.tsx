"use client";

import Link from "next/link";
import { MoreHorizontal, Settings, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";
import { getVisibleNavItems } from "../app-header/nav-items";

export function MobileBottomNav({ mode, currentPath }: { mode: Mode; currentPath: string }) {
  const [open, setOpen] = useState(false);
  const visible = getVisibleNavItems(mode);
  const primary = visible.slice(0, 4);
  const overflow = visible.slice(4);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm xl:hidden" onClick={() => setOpen(false)}>
          <section aria-label="سایر بخش‌ها" className="absolute inset-x-3 bottom-[calc(82px+env(safe-area-inset-bottom))] rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-3 shadow-[0_24px_70px_rgba(0,0,0,.3)]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between px-1"><strong className="text-sm">سایر بخش‌ها</strong><button type="button" onClick={() => setOpen(false)} aria-label="بستن منو" className="grid size-10 place-items-center rounded-xl hover:bg-[var(--accent-soft)]"><X aria-hidden="true" /></button></div>
            <div className="grid grid-cols-2 gap-2">
              {overflow.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-2xl bg-[var(--surface-2)] px-3 text-sm font-bold text-[var(--text)]"><Icon aria-hidden="true" className="size-5 text-[var(--accent-strong)]" />{label}</Link>)}
              <Link href="/settings" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-2xl bg-[var(--surface-2)] px-3 text-sm font-bold text-[var(--text)]"><Settings aria-hidden="true" className="size-5 text-[var(--accent-strong)]" />تنظیمات</Link>
            </div>
          </section>
        </div>
      )}
      <nav aria-label="ناوبری موبایل" className="fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom))] z-50 grid grid-cols-5 rounded-[20px] border border-[var(--border)] bg-[var(--surface-glass)] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.2)] backdrop-blur-2xl xl:hidden">
        {primary.map(({ href, label, icon: Icon }) => {
          const active = currentPath === href;
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold text-[var(--text-muted)]", active && "bg-[var(--accent-soft)] text-[var(--accent-strong)]")}><Icon aria-hidden="true" className="size-5" /><span>{label}</span></Link>;
        })}
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold text-[var(--text-muted)]", open && "bg-[var(--accent-soft)] text-[var(--accent-strong)]")}><MoreHorizontal aria-hidden="true" className="size-5" /><span>بیشتر</span></button>
      </nav>
    </>
  );
}
