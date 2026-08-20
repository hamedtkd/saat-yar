"use client";

import { BarChart3, CheckCircle2, ShieldCheck } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { getCloudflareWebAnalyticsConfig } from "@/lib/cloudflare-web-analytics";
import { cn } from "@/lib/cn";

export function CloudflareAnalyticsInfo({ compact = false }: { compact?: boolean }) {
  const { s } = useSystemUi();
  const config = getCloudflareWebAnalyticsConfig();
  const providerLabel = config.configured ? config.label : s("Not configured");

  return (
    <div data-cloudflare-web-analytics-info className={cn("grid gap-3", compact && "mx-auto max-w-[680px]") }>
      <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--surface-2)]", compact ? "p-3" : "p-4") }>
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><BarChart3 /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-[11px] text-[var(--text)]">{s("Privacy-friendly traffic analytics")}</strong>
            <small className="mt-1 block text-[9px] leading-5 text-[var(--text-muted)]">{s("Cloudflare Web Analytics measures aggregate visits and page performance without storing analytics cookies or browser-storage identifiers.")}</small>
          </span>
        </div>
        <div className="mt-3 grid gap-2 text-[9px] leading-5 text-[var(--text-muted)] sm:grid-cols-2">
          <span className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />{s("No custom work events are sent. Timer actions, work records, names, notes, salary, project content, and AppData stay out of analytics.")}</span>
          <span className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--accent-strong)]" />{s("Provider: {provider}", { provider: providerLabel })}</span>
        </div>
      </div>

      {!config.configured && (
        <p className="rounded-xl border border-[color-mix(in_srgb,var(--warning)_28%,var(--border))] bg-[var(--warning-soft)] px-3 py-2 text-[9px] leading-5 text-[var(--warning)]">
          {s("Traffic analytics is not configured in this build, so the Cloudflare beacon is not loaded.")}
        </p>
      )}
    </div>
  );
}
