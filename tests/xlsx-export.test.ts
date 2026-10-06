import assert from "node:assert/strict";
import test from "node:test";
import { strFromU8, unzipSync } from "fflate";
import { getFreelancerReportDescription } from "../lib/freelancer-report-description.ts";
import { exportExcel } from "../lib/exporters.ts";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function assertXml10Safe(value: string) {
  for (const character of value) {
    const codePoint = character.codePointAt(0)!;
    assert.ok(codePoint === 0x9 || codePoint === 0xa || codePoint === 0xd ||
      (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
      (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
      (codePoint >= 0x10000 && codePoint <= 0x10ffff), `invalid XML 1.0 code point U+${codePoint.toString(16)}`);
  }
}

async function captureExcelDownload(filename: string, title: string, headers: string[], rows: unknown[][]) {
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const oldCreate = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  const oldRevoke = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
  let downloadedFilename = "";
  let downloadedBlob: Blob | undefined;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { createElement: () => ({ click() {}, set download(value: string) { downloadedFilename = value; } }) },
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: (blob: Blob) => { downloadedBlob = blob; return "blob:test"; },
  });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: () => undefined });
  try {
    const blob = await exportExcel(filename, title, headers, rows);
    assert.equal(downloadedBlob, blob);
    return { blob, filename: downloadedFilename };
  } finally {
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument);
    else Reflect.deleteProperty(globalThis, "document");
    if (oldCreate) Object.defineProperty(URL, "createObjectURL", oldCreate);
    else Reflect.deleteProperty(URL, "createObjectURL");
    if (oldRevoke) Object.defineProperty(URL, "revokeObjectURL", oldRevoke);
    else Reflect.deleteProperty(URL, "revokeObjectURL");
  }
}

async function readWorkbook(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const files = unzipSync(bytes);
  const textFiles = Object.fromEntries(Object.entries(files).map(([name, content]) => [name, strFromU8(content)]));
  const workbook = textFiles["xl/workbook.xml"];
  const worksheet = textFiles["xl/worksheets/sheet1.xml"];
  assert.ok(workbook, "XLSX workbook metadata exists");
  assert.ok(worksheet, "XLSX worksheet exists");
  const sharedStrings = [...(textFiles["xl/sharedStrings.xml"]?.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g) ?? [])]
    .map((match) => match[1].replace(/<[^>]+>/g, ""));
  const decodeXmlText = (value: string) => value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_match, entity: string) => {
    if (entity[0] === "#") return String.fromCodePoint(entity[1]?.toLowerCase() === "x" ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[entity] ?? _match;
  });
  const readCell = (address: string) => {
    const match = worksheet.match(new RegExp(`<c\\b([^>]*)\\br="${address}"([^>]*)>([\\s\\S]*?)<\\/c>`));
    assert.ok(match, `cell ${address} exists`);
    const attributes = `${match[1]} ${match[2]}`;
    const body = match[3];
    if (/\bt="s"/.test(attributes)) {
      const index = Number(body.match(/<v>(\d+)<\/v>/)?.[1]);
      return { type: "string", value: sharedStrings[index] };
    }
    if (/\bt="inlineStr"/.test(attributes)) {
      const text = body.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/)?.[1];
      return { type: "string", value: text === undefined ? undefined : decodeXmlText(text) };
    }
    const type = /\bt="n"/.test(attributes) || (!/\bt=/.test(attributes) && /<v>/.test(body)) ? "number" : "value";
    return { type, value: body.match(/<v>([\s\S]*?)<\/v>/)?.[1] };
  };
  return { bytes, workbook, worksheet, textFiles, readCell };
}

test("Excel export produces a real XLSX workbook with a report worksheet", async () => {
  const { blob, filename } = await captureExcelDownload("report.xls", "Report", ["Date"], [["2026-10-04"]]);
  const workbook = await readWorkbook(blob);
  assert.deepEqual([...workbook.bytes.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
  assert.match(workbook.workbook, /name="Report"/);
  assert.equal(filename, "report.xlsx");
  assert.equal(blob.type, XLSX_MIME);
  assert.doesNotMatch(Object.values(workbook.textFiles).join(""), /<!doctype html|<html/i);
});

test("employee workbook preserves header order, values, labels, and numeric cells", async () => {
  const { blob } = await captureExcelDownload("employee.xlsx", "Employee report", ["Date", "Worked", "Balance", "Holiday", "Note"], [
    ["2026-10-04", "08:30", -120, "Yes", "Shift\u0001complete"],
    ["2026-10-05", 42, 12.5, "No", "Second day"],
  ]);
  const workbook = await readWorkbook(blob);
  assert.deepEqual(["A1", "B1", "C1", "D1", "E1"].map((address) => workbook.readCell(address).value), ["Date", "Worked", "Balance", "Holiday", "Note"]);
  assert.deepEqual(["A2", "B2", "C2", "D2", "E2"].map((address) => workbook.readCell(address).value), ["2026-10-04", "08:30", "-120", "Yes", "Shiftcomplete"]);
  assert.equal(workbook.readCell("C2").type, "number");
  assert.equal(workbook.readCell("A3").value, "2026-10-05");
  assert.equal(workbook.readCell("B3").value, "42");
  assert.equal(workbook.readCell("B3").type, "number");
  assert.equal(workbook.readCell("C3").value, "12.5");
  assert.equal(workbook.readCell("C3").type, "number");
});

test("freelancer workbook keeps the canonical Bug #10 Description and Persian text", async () => {
  const description = getFreelancerReportDescription({ note: "", task: "Implement\u0000dashboard" });
  const { blob } = await captureExcelDownload("freelancer.xlsx", "Freelancer report", ["Client", "Project", "Description"], [
    ["مشتری تست", "پروژه مهر", description],
    ["Client 2", "Project 2", "گزارش پروژه مهر"],
  ]);
  const workbook = await readWorkbook(blob);
  assert.deepEqual(["A2", "B2", "C2"].map((address) => workbook.readCell(address).value), ["مشتری تست", "پروژه مهر", "Implementdashboard"]);
  assert.equal(workbook.readCell("A3").value, "Client 2");
  assert.equal(workbook.readCell("C3").value, "گزارش پروژه مهر");
});

test("formula-looking user text is stored as literal string cells", async () => {
  const { blob } = await captureExcelDownload("safe.xlsx", "Safe report", ["Description", "Task"], [["=SUM(1,1)", "+1+1"], ["@something", "\u0001=SUM(1,1)"]]);
  const workbook = await readWorkbook(blob);
  assert.deepEqual(["A2", "B2", "A3", "B3"].map((address) => workbook.readCell(address)), [
    { type: "string", value: "=SUM(1,1)" },
    { type: "string", value: "+1+1" },
    { type: "string", value: "@something" },
    { type: "string", value: "=SUM(1,1)" },
  ]);
  assert.doesNotMatch(workbook.worksheet, /<f(?:\s|>)/);
});

test("XLSX removes XML 1.0-forbidden controls and lone surrogates from string cells", async () => {
  const { blob } = await captureExcelDownload("controls.xlsx", "Safe\u0000 report", ["NUL\u0000", "C0", "Surrogate"], [["abc\u0000def", "a\u0001b\u000Bc", "\uD800x\uDC00"]]);
  const workbook = await readWorkbook(blob);
  assert.equal(workbook.readCell("A1").value, "NUL");
  assert.deepEqual(["A2", "B2", "C2"].map((address) => workbook.readCell(address).value), ["abcdef", "abc", "x"]);
  assert.match(workbook.workbook, /name="Safe report"/);
  for (const xml of Object.values(workbook.textFiles)) assertXml10Safe(xml);
});

test("XLSX preserves valid whitespace controls, Persian, combining marks, emoji, and XML markup text", async () => {
  const value = "\tگزارش پروژه مهر\nمشتری آزمایشی\rسلام 👋e\u0301 & < > \"quotes\" 'single'";
  const { blob } = await captureExcelDownload("unicode.xlsx", "گزارش", ["Description"], [[value]]);
  const workbook = await readWorkbook(blob);
  assert.equal(workbook.readCell("A2").value, value);
  assert.equal(workbook.readCell("A2").type, "string");
  assert.match(workbook.worksheet, /&amp;.*&lt;.*&gt;.*&quot;.*&apos;/);
  assert.match(workbook.worksheet, /&#13;/);
});
