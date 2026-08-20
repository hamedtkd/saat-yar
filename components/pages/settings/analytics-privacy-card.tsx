"use client";

import { BarChart3 } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { CloudflareAnalyticsInfo } from "@/components/analytics/cloudflare-analytics-info";
import { getCloudflareWebAnalyticsConfig } from "@/lib/cloudflare-web-analytics";
import { useSystemUi } from "@/components/i18n/use-system-ui";

export function AnalyticsPrivacyCard() {
  const { s } = useSystemUi();
  const config = getCloudflareWebAnalyticsConfig();

  return (
    <section id="settings-analytics" data-cloudflare-web-analytics-settings className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5">
      <PanelHead icon={<BarChart3 />} title={s("Privacy-friendly traffic analytics")}>
        <StatusBadge tone={config.configured ? "success" : "neutral"}>{config.configured ? s("Enabled") : s("Not configured")}</StatusBadge>
      </PanelHead>
      <p className="mb-4 text-[10px] leading-6 text-[var(--text-muted)]">
        {s("Saatyar uses Cloudflare Web Analytics only to understand aggregate traffic and page performance. It does not send custom product events or work content.")}
      </p>
      <CloudflareAnalyticsInfo />
      <div className="mt-4 grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[9px] leading-5 text-[var(--text-muted)] sm:grid-cols-2">
        <p><strong className="block text-[10px] text-[var(--text)]">{s("Measured")}</strong>{s("Aggregate page views, visitors, referrers, and page-performance metrics exposed by Cloudflare Web Analytics.")}</p>
        <p><strong className="block text-[10px] text-[var(--text)]">{s("Never sent")}</strong>{s("Timer actions, onboarding choices, salary, income, client/project names, notes, work dates, exact clock times, record IDs, device-transfer payloads, or AppData.")}</p>
      </div>
    </section>
  );
}
