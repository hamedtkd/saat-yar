import assert from "node:assert/strict";
import test from "node:test";
import { exportCsv, protectCsvTextCell, serializeCsv } from "../lib/exporters.ts";
import { parseCsvText } from "../lib/import-wizard/csv-parser.ts";

async function captureCsvDownload(headers: string[], rows: unknown[][]) {
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const oldCreate = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  const oldRevoke = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
  let blob: Blob | undefined;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { createElement: () => ({ click() {} }) },
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: (value: Blob) => { blob = value; return "blob:test"; },
  });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: () => undefined });
  try {
    exportCsv("report.csv", headers, rows);
    assert.ok(blob);
    assert.deepEqual([...new Uint8Array(await blob.arrayBuffer()).slice(0, 3)], [0xef, 0xbb, 0xbf]);
    return await blob.text();
  } finally {
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument);
    else Reflect.deleteProperty(globalThis, "document");
    if (oldCreate) Object.defineProperty(URL, "createObjectURL", oldCreate);
    else Reflect.deleteProperty(URL, "createObjectURL");
    if (oldRevoke) Object.defineProperty(URL, "revokeObjectURL", oldRevoke);
    else Reflect.deleteProperty(URL, "revokeObjectURL");
  }
}

test("CSV text cells beginning with spreadsheet formula markers are exported as text", () => {
  for (const value of ["=SUM(1,1)", "+1+1", "-1+1", "@something", "＝SUM(1,1)"]) {
    assert.equal(protectCsvTextCell(value), `'${value}`);
  }
  assert.equal(serializeCsv(["Note"], [["=SUM(1,1)"]]), `Note\n"'=SUM(1,1)"`);
});

test("CSV text with leading spaces, tabs, newlines, and controls is neutralized", () => {
  for (const value of [" =SUM(1,1)", "\t=SUM(1,1)", "\r\n@cmd", "\u0000+1+1"]) {
    assert.equal(protectCsvTextCell(value), `'${value}`);
  }
  assert.equal(serializeCsv(["Note"], [["\t=SUM(1,1)"]]), `Note\n"'\t=SUM(1,1)"`);
});

test("legitimate numeric cells remain numeric while formula-like strings are protected", () => {
  assert.equal(serializeCsv(["Amount", "Description"], [[-120, "-120"]]), `Amount,Description\n-120,'-120`);
});

test("ordinary Persian text stays unchanged in UTF-8 CSV output", () => {
  assert.equal(serializeCsv(["یادداشت"], [["گزارش پروژه مهر"]]), "یادداشت\nگزارش پروژه مهر");
});

test("CSV quoting still preserves commas, quotes, and embedded newlines", () => {
  const input = `comma, quote " and line\nbreak`;
  const serialized = serializeCsv(["Note"], [[input]]);
  assert.equal(serialized, `Note\n"comma, quote "" and line\nbreak"`);
  assert.equal(parseCsvText(serialized).rows[0].Note, input);
});

test("employee CSV download neutralizes user notes and preserves negative numeric balances", async () => {
  const csv = await captureCsvDownload(
    ["Date", "Balance", "Holiday", "Note"],
    [["2026-10-04", -120, "No", "=SUM(1,1)"]],
  );
  assert.equal(csv, `Date,Balance,Holiday,Note\n2026-10-04,-120,No,"'=SUM(1,1)"`);
});

test("freelancer CSV download neutralizes user text fields without changing numeric cells", async () => {
  const csv = await captureCsvDownload(
    ["Client", "Project", "Description", "Minutes", "Rate", "Amount"],
    [["@company", "+internal", "-1+1", 90, -120, 240]],
  );
  assert.equal(csv, `Client,Project,Description,Minutes,Rate,Amount\n'@company,'+internal,'-1+1,90,-120,240`);
});

test("CSV headers also use the safe text-cell path", () => {
  assert.equal(serializeCsv(["=Formula", "Amount"], [[1, 2]]), `'=Formula,Amount\n1,2`);
});
