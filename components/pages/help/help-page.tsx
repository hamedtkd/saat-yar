"use client";

import Link from "next/link";
import { BookOpenCheck, ChevronRight, Info } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { useLocale } from "@/components/i18n/locale-provider";
import { getHelpCopy } from "@/lib/help-content";

export function HelpPage() {
  const { locale } = useLocale();
  const page = getHelpCopy(locale);

  return (
    <div className="grid min-w-0 max-w-full gap-4 overflow-x-clip text-start [overflow-wrap:anywhere] sm:gap-5" data-public-help-page>
      <PageHeading autosave={false} title={page.title} description={page.summary} />
      <div className="flex min-w-0 items-start gap-3 rounded-[var(--card-radius)] text-start border border-[var(--dashboard-border)] bg-[var(--accent-soft)] p-4 text-[10px] leading-6 text-[var(--text-muted)] sm:p-5">
        <Info className="mt-1 size-4 shrink-0 text-[var(--accent-strong)]" />
        <p className="min-w-0">{page.note}</p>
      </div>
      {page.sections.map((section) => (
        <section key={section.title} className="dashboard-card grid min-w-0 max-w-full justify-items-stretch gap-4 overflow-hidden rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-4 text-start sm:p-6">
          <div className="grid min-w-0 gap-1">
            <h2 className="text-base font-black text-[var(--text)]">{section.title}</h2>
            <p className="text-[10px] leading-6 text-[var(--text-muted)]">{section.intro}</p>
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-3 [&>*]:min-w-0">
            {section.items.map((item) => (
              <article key={item.title} className="grid min-w-0 content-start justify-items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-start">
                <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><BookOpenCheck className="size-4" /></span>
                <h3 className="text-[12px] font-black text-[var(--text)]">{item.title}</h3>
                <p className="text-[10px] leading-6 text-[var(--text-muted)]">{item.body}</p>
                {item.href && item.action && (
                  <Link href={item.href} className="mt-auto inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-[var(--dashboard-border)] px-3 text-[10px] font-bold text-[var(--accent-strong)] hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]">
                    <span>{item.action}</span><ChevronRight className="size-4 rtl:rotate-180" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
