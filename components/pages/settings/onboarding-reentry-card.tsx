"use client";

import { RotateCcw, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";

export function OnboardingReentryCard({ startOnboardingReentry }: { startOnboardingReentry: () => void }) {
  const router = useRouter();
  const { s } = useSystemUi();

  const reopen = () => {
    startOnboardingReentry();
    router.push("/onboarding");
  };

  return (
    <section id="settings-onboarding" className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5">
      <PanelHead icon={<Route />} title={s("Initial setup")}>
        <Button type="button" variant="outline" size="sm" onClick={reopen} data-onboarding-reentry-action="true">
          <RotateCcw aria-hidden="true" />
          {s("Run setup again")}
        </Button>
      </PanelHead>
      <div className="grid gap-3 rounded-[16px] bg-[var(--surface-2)] p-4 text-[10px] leading-6 text-[var(--text-muted)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <p className="m-0">{s("Open the wizard again to review your name, workspace, schedule, and storage guidance. Projects, work records, leave, and financial data are not deleted or reset.")}</p>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 font-semibold text-[var(--text)]">{s("Resume incomplete setup is enabled")}</span>
      </div>
      <p className="mt-3 text-[10px] leading-5 text-[var(--text-muted)]">{s("Wizard changes are stored on this device like other settings. If the browser closes midway, you continue from the same step next time.")}</p>
    </section>
  );
}
