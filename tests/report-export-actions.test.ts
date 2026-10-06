import assert from "node:assert/strict";
import test from "node:test";
import { strFromU8, unzipSync } from "fflate";
import { createInitialData } from "../lib/constants.ts";
import { exportCsv } from "../lib/exporters.ts";
import { enCatalog } from "../lib/i18n/en.ts";
import { faCatalog } from "../lib/i18n/fa.ts";
import { calculateReportPayroll } from "../lib/report-payroll.ts";
import { parseCsvText } from "../lib/import-wizard/csv-parser.ts";
import { getEmployeeDayPay } from "../lib/employee-report.ts";
import type { ReportFilter } from "../lib/types.ts";
import { useReportActions as createReportActions } from "../hooks/controller/use-report-actions.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const reportFilter: ReportFilter = { clientId: "all", projectId: "all", billable: "all", query: "", dateFrom: "", dateTo: "", status: "all" };

function makeAction(setToast: (message: string) => void, filter = reportFilter) {
  const data = createInitialData({ onboarded: true });
  data.settings.mode = "employee";
  const record = makeWorkRecord({ date: "2026-10-04", start: "08:00", end: "17:00", note: "یادداشت unchanged", lunchMinutes: 30, lunchPaid: true, breaks: [{ id: "break-1", start: "12:00", end: "12:15", title: "Break" }], leaveMinutes: 60, leaveType: "hourly", holiday: true });
  data.records[record.date] = record;
  const records = [record];
  return {
    data,
    record,
    records,
    exportReport: createReportActions({ data, filteredEntries: [], reportRecords: records, reportFilter: filter, calendar: "gregory", setToast }).exportReport,
  };
}

function mockDownload(options: { click?: () => void; create?: (blob: Blob) => string; deferRevoke?: boolean } = {}) {
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const oldCreate = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  const oldRevoke = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
  const oldSetTimeout = Object.getOwnPropertyDescriptor(globalThis, "setTimeout");
  const blobs: Blob[] = [];
  const revoked: string[] = [];
  const deferred: Array<() => void> = [];
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { createElement: () => ({ click: options.click ?? (() => {}) }) },
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: (blob: Blob) => {
      blobs.push(blob);
      if (options.create) return options.create(blob);
      return `blob:test-${blobs.length}`;
    },
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: (url: string) => revoked.push(url),
  });
  if (options.deferRevoke) {
    Object.defineProperty(globalThis, "setTimeout", {
      configurable: true,
      value: (callback: () => void) => { deferred.push(callback); return 0; },
    });
  }
  return {
    blobs,
    revoked,
    deferred,
    restore() {
      if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument);
      else Reflect.deleteProperty(globalThis, "document");
      if (oldCreate) Object.defineProperty(URL, "createObjectURL", oldCreate);
      else Reflect.deleteProperty(URL, "createObjectURL");
      if (oldRevoke) Object.defineProperty(URL, "revokeObjectURL", oldRevoke);
      else Reflect.deleteProperty(URL, "revokeObjectURL");
      if (oldSetTimeout) Object.defineProperty(globalThis, "setTimeout", oldSetTimeout);
      else Reflect.deleteProperty(globalThis, "setTimeout");
    },
  };
}

test("report export action reports CSV and XLSX success and completes normal URL cleanup", async () => {
  for (const kind of ["csv", "excel"] as const) {
    const messages: string[] = [];
    const action = makeAction((message) => messages.push(message));
    const snapshot = JSON.stringify(action.data);
    const download = mockDownload({ deferRevoke: true });
    try {
      await action.exportReport(kind);
      assert.deepEqual(download.revoked, [], "successful download keeps its URL alive until the next task");
      assert.equal(download.deferred.length, 1);
      download.deferred[0]();
    } finally {
      download.restore();
    }
    assert.deepEqual(messages, [kind === "csv" ? faCatalog["reports.export.downloaded"].replace("{kind}", "CSV") : faCatalog["reports.export.downloaded"].replace("{kind}", "Excel")]);
    assert.equal(download.blobs.length, 1);
    assert.deepEqual(download.revoked, ["blob:test-1"]);
    assert.equal(JSON.stringify(action.data), snapshot, "exporting does not mutate report data");
    if (kind === "csv") {
      assert.match(await download.blobs[0].text(), /یادداشت unchanged/);
      assert.equal(download.blobs[0].type, "text/csv;charset=utf-8");
    } else {
      assert.equal(download.blobs[0].type, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }
  }
});

test("Employee CSV preserves existing fields and includes table values plus report-range payroll", async () => {
  const messages: string[] = [];
  const action = makeAction((message) => messages.push(message));
  const download = mockDownload();
  try {
    await action.exportReport("csv", "employee");
    const parsed = parseCsvText(await download.blobs[0].text());
    const headers = parsed.headers;
    for (const column of ["تاریخ", "تعطیل", "ناهار (دقیقه)", "استراحت (دقیقه)", "حقوق تخمینی روزانه", "حقوق تخمینی بازه گزارش"]) assert.ok(headers.includes(column), column);
    assert.deepEqual(headers.slice(0, 8), ["تاریخ", "ورود", "خروج", "کارکرد", "مرخصی", "تراز", "تعطیل", "یادداشت"]);
    const row = parsed.rows[0];
    assert.equal(row["ناهار (دقیقه)"], "30");
    assert.equal(row["ناهار باحقوق"], "بله");
    assert.equal(row["استراحت (دقیقه)"], "15");
    assert.equal(row["تعداد استراحت"], "1");
    assert.equal(row["نوع مرخصی"], "مرخصی ساعتی");
    assert.equal(row["تعطیل"], "بله");
    assert.equal(row["یادداشت"], "یادداشت unchanged");
    assert.equal(row["حقوق تخمینی روزانه"], String(getEmployeeDayPay({ record: action.record, settings: action.data.settings })));
    assert.equal(parsed.rows.at(-1)?.["حقوق تخمینی بازه گزارش"], String(calculateReportPayroll(action.data, [action.record], reportFilter).net));
  } finally { download.restore(); }
});

test("active Freelancer export keeps the Freelancer schema in Hybrid mode", async () => {
  const data = createInitialData({ onboarded: true });
  data.settings.mode = "hybrid";
  data.clients = [{ id: "client", name: "مشتری فارسی", color: "#000000", archived: false }];
  data.projects = [{ id: "project", clientId: "client", name: "پروژه", rate: 100, color: "#000000", status: "active", billable: true }];
  const freelancerEntry = { id: "entry", clientId: "client", projectId: "project", task: "کار", startedAt: "2026-10-04T08:00:00.000Z", endedAt: "2026-10-04T09:00:00.000Z", note: "", billable: true, effectiveRate: 100 };
  const messages: string[] = [];
  const action = createReportActions({ data, filteredEntries: [freelancerEntry], reportRecords: [], reportFilter, calendar: "gregory", setToast: (message) => messages.push(message) });
  const download = mockDownload();
  try {
    await action.exportReport("csv", "freelancer");
    const parsed = parseCsvText(await download.blobs[0].text());
    assert.deepEqual(parsed.headers, ["تاریخ", "مشتری", "پروژه", "شرح", "مدت (دقیقه)", "نرخ مؤثر", "مبلغ", "قابل صورتحساب"]);
    assert.match(await download.blobs[0].text(), /مشتری فارسی/);
    assert.equal(parsed.headers.includes("ناهار (دقیقه)"), false);
  } finally { download.restore(); }
});

test("Employee CSV keeps formula-looking notes literal", async () => {
  const action = makeAction(() => {});
  action.record.note = "=SUM(1,1)";
  const download = mockDownload();
  try {
    await action.exportReport("csv", "employee");
    const parsed = parseCsvText(await download.blobs[0].text());
    assert.equal(parsed.rows[0]?.["یادداشت"], "'=SUM(1,1)");
  } finally { download.restore(); }
});

test("Employee XLSX uses the same Employee schema and keeps Persian text", async () => {
  const action = makeAction(() => {});
  const download = mockDownload();
  try {
    await action.exportReport("excel", "employee");
    const files = unzipSync(new Uint8Array(await download.blobs[0].arrayBuffer()));
    const worksheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
    assert.match(worksheet, /ناهار \(دقیقه\)/);
    assert.match(worksheet, /استراحت \(دقیقه\)/);
    assert.match(worksheet, /حقوق تخمینی روزانه/);
    assert.match(worksheet, /حقوق تخمینی بازه گزارش/);
    assert.match(worksheet, /یادداشت unchanged/);
  } finally { download.restore(); }
});

test("Employee export report payroll follows partial multi-month range proration", async () => {
  const filter = { ...reportFilter, dateFrom: "2026-01-12", dateTo: "2026-02-28" };
  const messages: string[] = [];
  const action = makeAction((message) => messages.push(message), filter);
  action.data.settings.payrollPolicy = {
    id: "fixed-monthly", title: "Fixed monthly", baseMode: "monthly-fixed", baseAmount: 3_100_000,
    standardDayMinutes: 480, rateBasis: "standard-month", standardMonthMinutes: 220 * 60,
    overtime: { mode: "ignore", multiplier: 0, hourlyRate: 0 }, holiday: { mode: "ignore", multiplier: 0, hourlyRate: 0 },
    deficit: { mode: "ignore", multiplier: 0 }, rounding: { mode: "nearest", increment: 1 },
  };
  const february = makeWorkRecord({ date: "2026-02-12", start: "08:00", end: "16:00" });
  action.data.records[february.date] = february;
  action.records.push(february);
  const download = mockDownload();
  try {
    await action.exportReport("csv", "employee");
    const parsed = parseCsvText(await download.blobs[0].text());
    const expected = calculateReportPayroll(action.data, action.records, filter).net;
    assert.equal(parsed.rows.at(-1)?.["حقوق تخمینی بازه گزارش"], String(expected));
    assert.ok(expected > 3_100_000 && expected < 6_200_000);
  } finally { download.restore(); }
});

test("report export action catches XLSX generation failures without a success toast", async () => {
  const messages: string[] = [];
  const action = makeAction((message) => messages.push(message));
  const originalTextEncoder = Object.getOwnPropertyDescriptor(globalThis, "TextEncoder");
  Object.defineProperty(globalThis, "TextEncoder", {
    configurable: true,
    value: class { constructor() { throw new Error("internal generation failure"); } },
  });
  try {
    await assert.doesNotReject(action.exportReport("excel"));
  } finally {
    if (originalTextEncoder) Object.defineProperty(globalThis, "TextEncoder", originalTextEncoder);
    else Reflect.deleteProperty(globalThis, "TextEncoder");
  }
  assert.deepEqual(messages, [faCatalog["reports.export.failed"]]);
});

test("report export action catches CSV download setup failure and uses localized feedback", async () => {
  const messages: string[] = [];
  const action = makeAction((message) => messages.push(message));
  const snapshot = JSON.stringify(action.data);
  const download = mockDownload({ create: () => { throw new Error("internal download failure"); } });
  try {
    await assert.doesNotReject(action.exportReport("csv"));
  } finally {
    download.restore();
  }
  assert.deepEqual(messages, [faCatalog["reports.export.failed"]]);
  assert.deepEqual(download.revoked, [], "an object URL that was never returned is not available to revoke");
  assert.equal(JSON.stringify(action.data), snapshot);
  assert.equal(faCatalog["reports.export.failed"], "خروجی ناموفق بود. لطفاً دوباره تلاش کن.");
});

test("download helper revokes a created URL when a later click fails", () => {
  const download = mockDownload({ click: () => { throw new Error("click failed"); } });
  try {
    assert.throws(() => exportCsv("report.csv", ["Date"], [["2026-10-04"]]), /click failed/);
    assert.deepEqual(download.revoked, ["blob:test-1"]);
  } finally {
    download.restore();
  }
});

test("localized failure message is available in both catalogs", () => {
  assert.equal(enCatalog["reports.export.failed"], "Export failed. Please try again.");
  assert.equal(faCatalog["reports.export.failed"], "خروجی ناموفق بود. لطفاً دوباره تلاش کن.");
});
