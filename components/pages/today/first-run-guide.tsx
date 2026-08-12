"use client";

import { ArrowRight, BriefcaseBusiness, CheckCircle2, Play, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { useFirstRunGuide } from "@/hooks/use-first-run-guide";
import type { Mode } from "@/lib/types";

export function FirstRunGuide({
  mode,
  hasClients,
  hasProjects,
  hasTrackedActivity,
  onStartWork,
}: {
  mode: Mode;
  hasClients: boolean;
  hasProjects: boolean;
  hasTrackedActivity: boolean;
  onStartWork: () => void;
}) {
  const router = useRouter();
  const { pending, dismiss } = useFirstRunGuide();
  const { t } = useLocaleUi();

  if (!pending || hasTrackedActivity) return null;

  const act = () => {
    if (mode === "employee" || mode === "hybrid") {
      dismiss();
      onStartWork();
      return;
    }
    if (!hasClients) {
      dismiss();
      router.push("/clients");
      return;
    }
    if (!hasProjects) {
      dismiss();
      router.push("/projects");
      return;
    }
    dismiss();
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>("[data-first-run-timer-relations]");
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.querySelector<HTMLElement>("button")?.focus();
    });
  };

  const description = mode === "employee"
    ? t("today.firstRun.employee")
    : mode === "hybrid"
      ? t("today.firstRun.hybrid")
      : !hasClients
        ? t("today.firstRun.freelancerClient")
        : !hasProjects
          ? t("today.firstRun.freelancerProject")
          : t("today.firstRun.freelancerTimer");

  const action = mode === "employee" || mode === "hybrid"
    ? t("today.firstRun.startWork")
    : !hasClients
      ? t("today.firstRun.createClient")
      : !hasProjects
        ? t("today.firstRun.createProject")
        : t("today.firstRun.chooseProject");

  return (
    <section
      data-first-run-guide
      className="dashboard-card mb-4 grid gap-4 rounded-[var(--card-radius)] border border-[color-mix(in_srgb,var(--accent)_28%,var(--dashboard-border))] bg-[linear-gradient(135deg,var(--accent-soft),var(--surface-1))] p-4 shadow-[0_6px_18px_rgba(0,0,0,.035)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-5"
      aria-labelledby="first-run-guide-title"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-[var(--accent-fill)] text-[var(--accent-foreground)]">
        {mode === "freelancer" ? <BriefcaseBusiness aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
      </span>
      <div className="grid gap-1">
        <strong id="first-run-guide-title" className="text-sm font-black text-[var(--text)]">{t("today.firstRun.title")}</strong>
        <p className="m-0 text-[11px] leading-6 text-[var(--text-muted)]">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Button type="button" onClick={act} data-first-run-primary>
          {mode === "employee" || mode === "hybrid" ? <Play aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          {action}
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={dismiss} data-first-run-dismiss aria-label={t("today.firstRun.dismiss")} title={t("today.firstRun.dismiss")}>
          <X aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
