"use client";

import { useEffect, useMemo, useState } from "react";
import { localDateKey } from "@/lib/format";
import { getProjectFinanceSummary } from "@/lib/project-finance";
import type { ExpenseCategory } from "@/lib/types";
import type { ExpenseDraft, ProjectDetailProps } from "./types";

const emptyExpense = (): ExpenseDraft => ({
  title: "",
  amount: 0,
  date: localDateKey(),
  category: "other" as ExpenseCategory,
  note: "",
});

export function useProjectDetail({ data, setData, project }: ProjectDetailProps) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDraft, setExpenseDraft] = useState<ExpenseDraft>(emptyExpense);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const entries = useMemo(
    () => data.timeEntries.filter((entry) => entry.projectId === project.id),
    [data.timeEntries, project.id],
  );
  const expenses = useMemo(
    () => data.expenses
      .filter((expense) => expense.projectId === project.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [data.expenses, project.id],
  );
  const summary = useMemo(
    () => getProjectFinanceSummary(project, data.timeEntries, data.expenses),
    [data.expenses, data.timeEntries, project],
  );

  function addExpense() {
    if (!expenseDraft.title.trim() || expenseDraft.amount <= 0) return;
    setData((previous) => ({
      ...previous,
      expenses: [{
        id: crypto.randomUUID(),
        projectId: project.id,
        clientId: project.clientId,
        title: expenseDraft.title.trim(),
        amount: expenseDraft.amount,
        date: expenseDraft.date,
        category: expenseDraft.category,
        note: expenseDraft.note.trim(),
        createdAt: new Date().toISOString(),
      }, ...previous.expenses],
    }));
    setExpenseDraft(emptyExpense());
    setShowExpenseForm(false);
  }

  function removeExpense(id: string) {
    setData((previous) => ({
      ...previous,
      expenses: previous.expenses.filter((expense) => expense.id !== id),
    }));
  }

  function toggleProjectStatus() {
    setData((previous) => ({
      ...previous,
      projects: previous.projects.map((item) => item.id === project.id
        ? { ...item, status: item.status === "active" ? "paused" : "active" }
        : item),
    }));
  }

  return {
    entries,
    expenses,
    summary,
    now,
    showExpenseForm,
    setShowExpenseForm,
    expenseDraft,
    setExpenseDraft,
    addExpense,
    removeExpense,
    toggleProjectStatus,
  };
}
