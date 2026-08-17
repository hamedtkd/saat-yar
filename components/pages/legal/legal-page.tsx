"use client";

import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { useLocale } from "@/components/i18n/locale-provider";
import { getLegalNavLabels, getPrivacyCopy, getTermsCopy } from "@/lib/legal-content";

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const { locale } = useLocale();
  const page = kind === "privacy" ? getPrivacyCopy(locale) : getTermsCopy(locale);
  const labels = getLegalNavLabels(locale);

  return <div className="grid min-w-0 max-w-full gap-4 overflow-x-clip [overflow-wrap:anywhere] sm:gap-5" data-public-legal-page>
    <PageHeading autosave={false} title={page.title} description={page.summary} />
    <section className="dashboard-card grid min-w-0 max-w-full gap-5 overflow-hidden rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 sm:p-6">
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><ShieldCheck /></span>
        <p className="text-[10px] leading-6 text-[var(--text-muted)]">{page.updated}</p>
      </div>
      {page.sections.map((section) => <article key={section.title} className="grid min-w-0 max-w-4xl gap-2">
        <h2 className="text-sm font-black text-[var(--text)]">{section.title}</h2>
        {section.paragraphs.map((paragraph) => <p key={paragraph} className="text-[10px] leading-7 text-[var(--text-muted)]">{paragraph}</p>)}
      </article>)}
      <nav className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4 text-[10px] font-bold">
        <Link href="/about" className="rounded-xl border border-[var(--border)] px-3 py-2 hover:border-[var(--accent)]">{labels.about}</Link>
        <Link href="/help" className="rounded-xl border border-[var(--border)] px-3 py-2 hover:border-[var(--accent)]">{labels.help}</Link>
        <Link href="/privacy" className="rounded-xl border border-[var(--border)] px-3 py-2 hover:border-[var(--accent)]">{labels.privacy}</Link>
        <Link href="/terms" className="rounded-xl border border-[var(--border)] px-3 py-2 hover:border-[var(--accent)]">{labels.terms}</Link>
        <a href="https://github.com/hamedtkd/saat-yar" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 hover:border-[var(--accent)]">{labels.source}<ExternalLink className="size-3" /></a>
      </nav>
    </section>
  </div>;
}
