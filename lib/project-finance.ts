import { entryMinutes } from "./format.ts";
import type { Expense, Project, TimeEntry } from "./types.ts";

export type ProjectFinanceSummary = {
  trackedMinutes: number;
  billableMinutes: number;
  budgetMinutes: number;
  budgetProgress: number;
  budgetStatus: "none" | "healthy" | "warning" | "exceeded";
  remainingMinutes: number;
  revenue: number;
  expenses: number;
  profit: number;
  marginPercent: number | null;
};

export function getProjectFinanceSummary(
  project: Project,
  entries: TimeEntry[],
  expenses: Expense[],
  now = Date.now(),
): ProjectFinanceSummary {
  const projectEntries = entries.filter((entry) => entry.projectId === project.id);
  const projectExpenses = expenses.filter((expense) => expense.projectId === project.id);
  const trackedMinutes = projectEntries.reduce((sum, entry) => sum + entryMinutes(entry, now), 0);
  const billableMinutes = projectEntries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entryMinutes(entry, now), 0);
  const budgetMinutes = Math.max(0, (project.budgetHours ?? 0) * 60);
  const budgetProgress = budgetMinutes > 0 ? Math.round((trackedMinutes / budgetMinutes) * 100) : 0;
  const budgetStatus = budgetMinutes <= 0
    ? "none"
    : budgetProgress >= 100
      ? "exceeded"
      : budgetProgress >= 80
        ? "warning"
        : "healthy";
  const revenue = projectEntries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + (entryMinutes(entry, now) / 60) * entry.effectiveRate, 0);
  const expenseTotal = projectExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = revenue - expenseTotal;

  return {
    trackedMinutes,
    billableMinutes,
    budgetMinutes,
    budgetProgress,
    budgetStatus,
    remainingMinutes: Math.max(0, budgetMinutes - trackedMinutes),
    revenue,
    expenses: expenseTotal,
    profit,
    marginPercent: revenue > 0 ? Math.round((profit / revenue) * 100) : null,
  };
}
