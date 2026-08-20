"use client";

import { FolderKanban, WalletCards } from "lucide-react";
import { useState } from "react";
import { ProjectRateField } from "@/components/common/project-rate-field";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberField } from "@/components/common/number-field";
import { addOnboardingProject } from "@/lib/onboarding-workspace";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";

export function FreelancerProjectStep({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const { s } = useSystemUi();
  const [clientId, setClientId] = useState(data.clients.find((client) => !client.archived)?.id ?? "");
  const [name, setName] = useState("");
  const [rate, setRate] = useState(850_000);
  const [budgetHours, setBudgetHours] = useState(60);
  const [status, setStatus] = useState("");

  function saveProject() {
    if (!clientId) return setStatus(s("A client is required to create a project. Go back or skip this step."));
    if (!name.trim()) return setStatus(s("Enter a project name or skip this step for now."));
    const result = addOnboardingProject(data, { clientId, name, rate, budgetHours });
    setData(result.data);
    setStatus(result.created ? s("The project is ready and its rate will be used by billable timers.") : s("This project already exists for the selected client."));
    if (result.created) setName("");
  }

  return (
    <StepShell>
      <div className="mx-auto mb-7 max-w-[720px] text-center"><span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><FolderKanban /></span><h1>{s("Set up your first project and rate")}</h1><p>{s("Choose a client, set a project rate in the unit that makes sense to you, and Saatyar will normalize it for timer income.")}</p></div>
      <div className="mx-auto grid max-w-[860px] gap-5 rounded-[26px] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-4 text-start shadow-[0_16px_46px_rgba(0,0,0,.06)] sm:grid-cols-2 sm:p-6" data-onboarding-freelancer-project data-onboarding-inline-form>
        <label className="grid gap-2 text-[11px] font-bold text-[var(--text-muted)] sm:col-span-2">{s("Client")}<Select value={clientId} onValueChange={setClientId} disabled={data.clients.length === 0}><SelectTrigger data-onboarding-project-client><SelectValue placeholder={data.clients.length ? s("Select a client") : s("No clients yet")} /></SelectTrigger><SelectContent>{data.clients.filter((client) => !client.archived).map((client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label>
        <label className="grid gap-2 text-[11px] font-bold text-[var(--text-muted)] sm:col-span-2">{s("Project name")}<Input data-onboarding-project-name value={name} onChange={(event) => setName(event.target.value)} placeholder={s("For example, Website design")} /></label>
        <label className="grid gap-2 text-[11px] font-bold text-[var(--text-muted)]"><span>{s("Project rate")} <span className="font-normal">({s("Toman")})</span></span><ProjectRateField hourlyRate={rate} onHourlyRateChange={setRate} /></label>
        <label className="grid content-start gap-2 text-[11px] font-bold text-[var(--text-muted)]"><span>{s("Time budget")} <span className="font-normal">({s("Hours")})</span></span><NumberField min={0} step={1} value={budgetHours} onValueChange={setBudgetHours} className="h-12"/><span className="text-[10px] font-normal leading-5">{s("Time budget is optional and only powers progress and near-limit warnings.")}</span></label>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2"><Button type="button" data-onboarding-project-create onClick={saveProject} disabled={data.clients.length === 0}><WalletCards /> {s("Save project")}</Button><span className="text-[10px] leading-5 text-[var(--text-muted)]">{s("If you have many projects, CSV in the Import step is faster.")}</span></div>
        {status && <p role="status" className="text-[10px] font-semibold leading-5 text-[var(--accent-strong)] sm:col-span-2">{status}</p>}
      </div>
    </StepShell>
  );
}
