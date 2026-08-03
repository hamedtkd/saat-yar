import assert from "node:assert/strict";
import test from "node:test";
import { getProjectFinanceSummary } from "../lib/project-finance.ts";
import type { Expense, Project, TimeEntry } from "../lib/types.ts";

const project: Project = {
  id: "p1",
  clientId: "c1",
  name: "پروژه آزمایشی",
  rate: 1_000_000,
  color: "#000",
  status: "active",
  budgetHours: 10,
  billable: true,
};

function entry(id: string, hours: number, billable = true): TimeEntry {
  const startedAt = new Date("2026-08-01T08:00:00.000Z");
  return {
    id,
    clientId: "c1",
    projectId: "p1",
    startedAt: startedAt.toISOString(),
    endedAt: new Date(startedAt.getTime() + hours * 3_600_000).toISOString(),
    note: "",
    billable,
    effectiveRate: 1_000_000,
  };
}

function expense(id: string, amount: number): Expense {
  return {
    id,
    projectId: "p1",
    clientId: "c1",
    title: "هزینه",
    amount,
    date: "2026-08-01",
    category: "software",
    createdAt: "2026-08-01T00:00:00.000Z",
  };
}

test("calculates revenue, expenses and net profit", () => {
  const summary = getProjectFinanceSummary(project, [entry("e1", 4)], [expense("x1", 500_000)]);
  assert.equal(summary.revenue, 4_000_000);
  assert.equal(summary.expenses, 500_000);
  assert.equal(summary.profit, 3_500_000);
  assert.equal(summary.marginPercent, 88);
});

test("warns at 80 percent and marks exceeded budgets", () => {
  assert.equal(getProjectFinanceSummary(project, [entry("e1", 8)], []).budgetStatus, "warning");
  assert.equal(getProjectFinanceSummary(project, [entry("e1", 11)], []).budgetStatus, "exceeded");
});

test("does not count non-billable time as revenue", () => {
  const summary = getProjectFinanceSummary(project, [entry("e1", 3, false)], []);
  assert.equal(summary.trackedMinutes, 180);
  assert.equal(summary.revenue, 0);
  assert.equal(summary.marginPercent, null);
});
