"use client";

import { ExpensesPanel } from "./detail/expenses-panel";
import { ProjectAlerts } from "./detail/project-alerts";
import { ProjectHeader } from "./detail/project-header";
import { ProjectInfo } from "./detail/project-info";
import { ProjectSummary } from "./detail/project-summary";
import { TimeEntriesPanel } from "./detail/time-entries-panel";
import type { ProjectDetailProps } from "./detail/types";
import { useProjectDetail } from "./detail/use-project-detail";

export function ProjectDetail(props: ProjectDetailProps) {
  const view = useProjectDetail(props);
  const client = props.data.clients.find((item) => item.id === props.project.clientId);
  return <>
    <ProjectHeader project={props.project} client={client} activeEntry={props.activeEntry} onBack={props.onBack} onToggleTimer={() => props.onToggleTimer(props.project.id)} onToggleStatus={view.toggleProjectStatus} />
    <ProjectAlerts summary={view.summary} />
    <ProjectSummary project={props.project} summary={view.summary} financialsHidden={props.financialsHidden} />
    <ExpensesPanel expenses={view.expenses} showForm={view.showExpenseForm} setShowForm={view.setShowExpenseForm} draft={view.expenseDraft} setDraft={view.setExpenseDraft} onSave={view.addExpense} onRemove={view.removeExpense} financialsHidden={props.financialsHidden} />
    <section className="grid grid-cols-[minmax(0,1fr)_250px] gap-[14px] max-[900px]:grid-cols-1">
      <TimeEntriesPanel entries={view.entries} now={view.now} />
      <ProjectInfo project={props.project} financialsHidden={props.financialsHidden} />
    </section>
  </>;
}
