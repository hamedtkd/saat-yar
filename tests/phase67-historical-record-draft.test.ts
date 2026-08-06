import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { getWorkRecordChanges } from "../lib/work-record-diff.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const base = makeWorkRecord({
  date: "2026-08-05",
  start: "08:30",
  end: "16:30",
  lunchMinutes: 30,
  lunchStart: "12:30",
  lunchEnd: "13:00",
  note: "نسخه قبلی",
});

test("historical record diff reports only changed fields", () => {
  const changes = getWorkRecordChanges(base, { ...base, end: "17:00", note: "نسخه جدید" });
  assert.deepEqual(changes.map((item) => item.key), ["end", "note"]);
});

test("completed records edit through an isolated draft with explicit save and cancel", async () => {
  const source = await readFile(new URL("../components/pages/today/completed-day-editor.tsx", import.meta.url), "utf8");
  assert.match(source, /const \[draft, setDraft\] = useState<WorkRecord>/);
  assert.match(source, /ذخیره تغییرات/);
  assert.match(source, /انصراف/);
  assert.match(source, /getWorkRecordChanges/);
  assert.match(source, /updateRecord\(saved\)/);
});

test("completed historical days hide live lunch and break actions", async () => {
  const source = await readFile(new URL("../components/pages/today/completed-day-editor.tsx", import.meta.url), "utf8");
  const strip = await readFile(new URL("../components/pages/today/today-time-strip.tsx", import.meta.url), "utf8");
  assert.match(source, /showQuickActions=\{!completed\}/);
  assert.match(strip, /showQuickActions !== false/);
});
