"use client";

import Link from "next/link";
import { BookOpenCheck, CalendarDays, HeartHandshake, UserRound, Send, ShieldCheck, Smartphone, TimerReset } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PageHeading } from "@/components/common/page-heading";
import type { SystemMessageKey } from "@/lib/i18n/system";

const externalLinks: Array<{ label: SystemMessageKey | "Telegram @hamed_tkd"; href: string; icon: typeof BookOpenCheck }> = [
  { label: "Source code on GitHub", href: "https://github.com/hamedtkd/saat-yar", icon: BookOpenCheck },
  { label: "Optional financial support", href: "https://daramet.com/hamedtkd", icon: HeartHandshake },
  { label: "Hamed Ahmadi on LinkedIn", href: "https://www.linkedin.com/in/hamed-ahmadi1/", icon: UserRound },
  { label: "Telegram @hamed_tkd", href: "https://t.me/hamed_tkd", icon: Send },
];
const guides: Array<{ title: SystemMessageKey; description: SystemMessageKey; icon: typeof TimerReset }> = [
  { title: "Record workdays", description: "Use Today to record clock-in, clock-out, lunch, breaks, and the daily note.", icon: TimerReset },
  { title: "Schedule and payroll", description: "In Settings, configure workdays, weekly target, and payroll calculation for your contract.", icon: BookOpenCheck },
  { title: "Backup and transfer", description: "Create JSON backups or transfer encrypted data directly with QR and WebRTC.", icon: Smartphone },
  { title: "Privacy", description: "Core data stays on this device; Saatyar does not require a cloud account to store personal data.", icon: ShieldCheck },
];

export function AboutPage() {
  const { s } = useSystemUi();
  return <div className="grid gap-5">
    <PageHeading autosave={false} title={s("About and guide")} description={s("A short guide to usage, privacy, source code, and ways to contact the creator.")} />
    <section className="dashboard-card grid gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 sm:p-6">
      <div className="grid max-w-4xl gap-2"><strong className="text-lg text-[var(--text)]">{s("What is Saatyar?")}</strong><p className="text-[11px] leading-7 text-[var(--text-muted)]">{s("Saatyar is a Persian, local-first tool for work time, attendance and leave, clients and projects, invoices, reports, and payroll. Everyday work continues without an account and even while offline.")}</p></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{guides.map(({ title, description, icon: Icon }) => <article key={title} className="grid content-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Icon /></span><strong className="text-[12px] text-[var(--text)]">{s(title)}</strong><p className="text-[10px] leading-6 text-[var(--text-muted)]">{s(description)}</p></article>)}</div>
    </section>
    <section className="dashboard-card grid gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 sm:p-6" data-google-oauth-disclosure>
      <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><CalendarDays /></span><div className="grid gap-1"><strong className="text-sm text-[var(--text)]">{s("Google Calendar integration")}</strong><p className="max-w-4xl text-[10px] leading-6 text-[var(--text-muted)]">{s("Google Calendar is optional. Saatyar lists calendars so you can choose a source, then lets you view, create, edit, delete, synchronize, and resolve conflicts for events you explicitly manage. OAuth tokens stay in browser memory and the local sync cache stays on this device.")}</p></div></div>
      <div className="flex flex-wrap gap-2 text-[10px] font-bold"><Link href="/privacy" className="rounded-xl border border-[var(--border)] px-3 py-2 hover:border-[var(--accent)]">{s("Privacy Policy")}</Link><Link href="/terms" className="rounded-xl border border-[var(--border)] px-3 py-2 hover:border-[var(--accent)]">{s("Terms of Service")}</Link></div>
    </section>
    <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div className="dashboard-card grid gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 sm:p-6"><div className="grid gap-1"><strong className="text-sm text-[var(--text)]">{s("Quick start")}</strong><span className="text-[10px] leading-5 text-[var(--text-muted)]">{s("If you are new, this order is the simplest.")}</span></div><ol className="grid gap-3 text-[10px] leading-6 text-[var(--text-muted)]"><li className="rounded-xl bg-[var(--surface-2)] p-3"><strong className="text-[var(--text)]">{s("1. Set your schedule:")}</strong> {s("Set your weekly target, active days, start/end time, and lunch in Settings.")}</li><li className="rounded-xl bg-[var(--surface-2)] p-3"><strong className="text-[var(--text)]">{s("2. Record your day:")}</strong> {s("Today is the center for clock-in, clock-out, breaks, and current work.")}</li><li className="rounded-xl bg-[var(--surface-2)] p-3"><strong className="text-[var(--text)]">{s("3. Review results:")}</strong> {s("Use Month and Reports to review work, time balance, and payroll.")}</li><li className="rounded-xl bg-[var(--surface-2)] p-3"><strong className="text-[var(--text)]">{s("4. Back up:")}</strong> {s("Create a backup periodically or transfer data directly between devices.")}</li></ol></div>
      <div className="dashboard-card grid content-start gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 sm:p-6"><div className="grid gap-1"><strong className="text-sm text-[var(--text)]">{s("Links and contact")}</strong><span className="text-[10px] leading-5 text-[var(--text-muted)]">{s("Source code, optional support, and direct contact links.")}</span></div><div className="grid gap-2">{externalLinks.map(({ label, href, icon: Icon }) => <a key={href} href={href} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[10px] font-bold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"><Icon className="text-[var(--accent-strong)]" />{label === "Telegram @hamed_tkd" ? label : s(label)}</a>)}</div><p className="rounded-xl bg-[var(--accent-soft)] p-3 text-[9px] leading-5 text-[var(--text-muted)]">{s("Financial support is completely optional and unlocks no extra features. Report bugs and technical suggestions on GitHub; LinkedIn and Telegram are available for direct contact.")}</p></div>
    </section>
  </div>;
}
