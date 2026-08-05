import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const COMPONENTS = join(process.cwd(), "components");

function lineCount(file: string) {
  return readFileSync(file, "utf8").split(/\r?\n/).length;
}

function moduleFiles(directory: string) {
  return readdirSync(directory)
    .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"))
    .map((name) => join(directory, name));
}

test("onboarding and time picker modules stay below 250 lines", () => {
  const files = [
    join(COMPONENTS, "layout", "onboarding.tsx"),
    ...moduleFiles(join(COMPONENTS, "layout", "onboarding")),
    join(COMPONENTS, "pickers", "time-picker.tsx"),
    ...moduleFiles(join(COMPONENTS, "pickers", "time-picker")),
  ];

  for (const file of files) {
    assert.ok(lineCount(file) <= 250, `${file} exceeds 250 lines`);
  }
});

test("onboarding delegates steps and settings mutation", () => {
  const facade = readFileSync(
    join(COMPONENTS, "layout", "onboarding.tsx"),
    "utf8",
  );

  assert.match(facade, /useOnboardingSettings/);
  assert.match(facade, /<WelcomeStep/);
  assert.match(facade, /<ModeStep/);
  assert.match(facade, /<ScheduleStep/);
  assert.match(facade, /<PrivacyStep/);
  assert.doesNotMatch(facade, /weeklyMinutes \/ 60/);
});

test("time picker delegates state, trigger and dialog rendering", () => {
  const facade = readFileSync(
    join(COMPONENTS, "pickers", "time-picker.tsx"),
    "utf8",
  );

  assert.match(facade, /useTimePicker/);
  assert.match(facade, /<TimePickerTrigger/);
  assert.match(facade, /<TimePickerDialog/);
  assert.doesNotMatch(facade, /Array\.from/);
  assert.doesNotMatch(facade, /normalizeTime/);
});
