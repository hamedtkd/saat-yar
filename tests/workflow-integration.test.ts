import assert from "node:assert/strict";
import test from "node:test";
import { createBackupEnvelope, mergeAppData, parseBackupEnvelope } from "../lib/backup-workflow.ts";
import { createInitialData } from "../lib/constants.ts";
import { calc } from "../lib/time-engine.ts";
import { calculateEmployeeDayPay } from "../lib/payroll.ts";
import { getProjectFinanceSummary } from "../lib/project-finance.ts";
import { getInvoiceTotals, getEffectiveInvoiceStatus, nextInvoiceNumber } from "../lib/invoices.ts";
import { APP_DATA_KEYS } from "../lib/data/app-data-contract.ts";
import type { AppData, Invoice } from "../lib/types.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const DAY_TARGET = 8 * 60;

test("employee attendance workflow calculates work, overtime and pay", () => {
  const record = makeWorkRecord({
    date: "2026-08-05",
    start: "08:00",
    end: "18:00",
    lunchMinutes: 60,
    breaks: [{ id: "b1", start: "15:00", end: "15:15", title: "استراحت", paid: false }],
  });

  const result = calc(record, DAY_TARGET, new Date("2026-08-05T18:00:00"));
  assert.equal(result.worked, 525);
  assert.equal(result.balance, 45);
  assert.ok(calculateEmployeeDayPay({
    monthlySalary: 30_000_000,
    creditedMinutes: result.credited,
    dailyTargetMinutes: DAY_TARGET,
    overtimeMultiplier: 1.4,
  }) > 1_000_000);
});

test("freelancer workflow connects tracked time, expenses and invoice totals", () => {
  const project = { id: "p1", clientId: "c1", name: "وب‌سایت", rate: 1_000_000, color: "#000", status: "active" as const, budgetHours: 10, billable: true };
  const entries = [
    { id: "t1", clientId: "c1", projectId: "p1", startedAt: "2026-08-05T08:00:00Z", endedAt: "2026-08-05T11:00:00Z", note: "", billable: true, effectiveRate: 1_000_000 },
    { id: "t2", clientId: "c1", projectId: "p1", startedAt: "2026-08-05T12:00:00Z", endedAt: "2026-08-05T13:00:00Z", note: "", billable: false, effectiveRate: 1_000_000 },
  ];
  const expenses = [{ id: "e1", projectId: "p1", clientId: "c1", title: "هاست", amount: 500_000, date: "2026-08-05", category: "software" as const, createdAt: "2026-08-05T00:00:00Z" }];
  const summary = getProjectFinanceSummary(project, entries, expenses);

  assert.equal(summary.trackedMinutes, 240);
  assert.equal(summary.billableMinutes, 180);
  assert.equal(summary.revenue, 3_000_000);
  assert.equal(summary.profit, 2_500_000);

  const invoice: Invoice = {
    id: "i1", number: nextInvoiceNumber([], "1405"), clientId: "c1", projectId: "p1",
    issuedAt: "2026-08-05", dueAt: "2026-08-10", status: "sent",
    lines: [{ id: "l1", description: "خدمات توسعه", quantity: 3, unitPrice: 1_000_000 }],
    discount: 0, taxPercent: 10, note: "", createdAt: "2026-08-05T00:00:00Z",
  };
  assert.equal(getInvoiceTotals(invoice).total, 3_300_000);
  assert.equal(getEffectiveInvoiceStatus(invoice, "2026-08-11"), "overdue");
});

test("backup workflow round-trips and merges without duplicate ids", () => {
  const base = createInitialData({ onboarded: true });
  base.clients.push({ id: "c1", name: "مشتری اول", color: "#000", archived: false });
  const envelope = createBackupEnvelope(base, "2026-08-05T00:00:00.000Z");
  const restored = parseBackupEnvelope(JSON.parse(JSON.stringify(envelope)));
  assert.deepEqual(restored.clients, base.clients);
  assert.deepEqual(Object.keys(restored).sort(), [...APP_DATA_KEYS].sort());
  assert.equal("appName" in restored, false);
  assert.equal("schemaVersion" in restored, false);

  const incoming: AppData = structuredClone(restored);
  incoming.clients.push({ id: "c2", name: "مشتری دوم", color: "#111", archived: false });
  incoming.clients.push({ id: "c1", name: "نسخه تکراری", color: "#222", archived: false });
  const merged = mergeAppData(restored, incoming);
  assert.deepEqual(merged.clients.map((client) => client.id), ["c1", "c2"]);
});
