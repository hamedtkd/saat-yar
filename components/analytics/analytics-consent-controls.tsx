"use client";

import { BarChart3, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { useProductAnalyticsConsent } from "@/hooks/use-product-analytics-consent";
import { getProductAnalyticsProviderConfig } from "@/lib/product-analytics";
import { cn } from "@/lib/cn";

export function AnalyticsConsentControls({ compact = false }: { compact?: boolean }) {
  const { s } = useSystemUi();
  const { consent, grant, deny } = useProductAnalyticsConsent();
  const provider = getProductAnalyticsProviderConfig();
  const enabled = consent !== "denied" && provider.configured;
  const providerLabel = provider.configured ? provider.label : s("Not configured");

  return (
    <div data-product-analytics-consent className={cn("grid gap-3", compact && "mx-auto max-w-[680px]") }>
      <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--surface-2)]", compact ? "p-3" : "p-4") }>
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><BarChart3 /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-[11px] text-[var(--text)]">{s("Privacy-safe product analytics")}</strong>
            <small className="mt-1 block text-[9px] leading-5 text-[var(--text-muted)]">{s("Only coarse product events are allowed. Salary, income, names, notes, project titles, dates, exact times, IDs, and free-text content are never included.")}</small>
          </span>
        </div>
        <div className="mt-3 grid gap-2 text-[9px] leading-5 text-[var(--text-muted)] sm:grid-cols-2">
          <span className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />{s("Anonymous product analytics is enabled by default when configured. You can turn it off at any time; advertising signals stay disabled.")}</span>
          <span className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--accent-strong)]" />{s("Provider: {provider}", { provider: providerLabel })}</span>
        </div>
      </div>

      {!provider.configured && (
        <p className="rounded-xl border border-[color-mix(in_srgb,var(--warning)_28%,var(--border))] bg-[var(--warning-soft)] px-3 py-2 text-[9px] leading-5 text-[var(--warning)]">
          {s("Analytics is not configured in this build, so no analytics request can leave the device.")}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={grant} disabled={!provider.configured} aria-pressed={enabled} data-analytics-opt-in>
          <CheckCircle2 /> {enabled ? s("Anonymous analytics is on") : s("Turn anonymous analytics on")}
        </Button>
        <Button type="button" size="sm" variant={consent === "denied" ? "secondary" : "outline"} onClick={deny} aria-pressed={consent === "denied"} data-analytics-opt-out>
          <XCircle /> {s("Turn analytics off")}
        </Button>
      </div>
    </div>
  );
}
