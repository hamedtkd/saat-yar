"use client";

import { BarChart3 } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { AnalyticsConsentControls } from "@/components/analytics/analytics-consent-controls";
import { useProductAnalyticsConsent } from "@/hooks/use-product-analytics-consent";
import { getProductAnalyticsProviderConfig } from "@/lib/product-analytics";
import { useSystemUi } from "@/components/i18n/use-system-ui";

export function AnalyticsPrivacyCard() {
  const { s } = useSystemUi();
  const { consent } = useProductAnalyticsConsent();
  const provider = getProductAnalyticsProviderConfig();
  const active = consent === "granted" && provider.configured;
  const label = active ? s("Enabled") : consent === "denied" ? s("Off") : s("Not decided");

  return (
    <section id="settings-analytics" data-product-analytics-settings className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5">
      <PanelHead icon={<BarChart3 />} title={s("Privacy-safe product analytics")}>
        <StatusBadge tone={active ? "success" : "neutral"}>{label}</StatusBadge>
      </PanelHead>
      <p className="mb-4 text-[10px] leading-6 text-[var(--text-muted)]">
        {s("Saatyar keeps work data local-first. Optional analytics measures only product funnels and coarse feature usage so the app can improve without sending your work content.")}
      </p>
      <AnalyticsConsentControls />
      <div className="mt-4 grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[9px] leading-5 text-[var(--text-muted)] sm:grid-cols-2">
        <p><strong className="block text-[10px] text-[var(--text)]">{s("Allowed event groups")}</strong>{s("Onboarding steps, route discovery, start/finish work, feature usage, and generic UX error categories.")}</p>
        <p><strong className="block text-[10px] text-[var(--text)]">{s("Never sent")}</strong>{s("Salary, income, client/project names, notes, calendar dates, exact clock times, record IDs, device-transfer payloads, or typed free text.")}</p>
      </div>
    </section>
  );
}
