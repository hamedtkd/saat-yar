import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("date changes reset transient timer fields and load only that day's note", async () => {
  const source = await read("hooks/use-saatyar-controller.ts");
  assert.match(source, /function setSelectedDate\(date: string\)/);
  assert.match(source, /setTimerDraft\(\{ \.\.\.initialTimerDraft, note: data\.records\[date\]\?\.note \?\? "" \}\)/);
  assert.match(source, /setEditingEntry\(""\)/);
});

test("employee notes belong to the selected work record instead of a global timer draft", async () => {
  const source = await read("components/pages/today/today-focus-card.tsx");
  assert.match(source, /value=\{props\.record\.note\}/);
  assert.match(source, /props\.updateRecord\(\{ note: event\.target\.value \}\)/);
});

test("completed days are read only until explicit edit", async () => {
  const source = await read("components/pages/today/completed-day-editor.tsx");
  const actions = await read("components/pages/today/completed-day-edit-action-bar.tsx");
  assert.match(source, /completed = Boolean\(record\.start && record\.end\)/);
  assert.match(source, /disabled=\{locked\}/);
  assert.match(source, /t\("today\.edit\.start"\)/);
  assert.match(source, /CompletedDayEditActionBar/);
  assert.match(actions, /t\("common\.saveChanges"\)/);
  assert.match(actions, /t\("common\.cancel"\)/);
});

test("day editor state resets when selected date changes", async () => {
  const source = await read("components/pages/today/today-page.tsx");
  assert.match(source, /<CompletedDayEditor key=\{`\$\{props\.selectedDate\}:\$\{props\.record\.start && props\.record\.end \? "completed" : "active"\}`\}/);
});
