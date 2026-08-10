import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { defaultSettings } from "../lib/constants.ts";
import { themePresets } from "../lib/theme.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("cyan is the default brand palette while alternate themes remain available", () => {
  assert.equal(defaultSettings.appearance.preset, "spotify");
  assert.equal(defaultSettings.appearance.accent, "#06b6d4");
  assert.equal(themePresets.spotify, "#06b6d4");
  assert.equal(themePresets.emerald, "#10b981");
  assert.equal(themePresets.ocean, "#0ea5e9");
  const card = read("components/pages/settings/appearance/appearance-settings-card.tsx");
  assert.match(card, /spotify: "Turquoise"/);
  assert.match(card, /emerald: "Green"/);
  assert.match(card, /ocean: "Blue"/);
  const system = read("lib/i18n/system.ts");
  assert.match(system, /"Turquoise": "فیروزه‌ای"/);
  assert.match(system, /"Green": "سبز"/);
  assert.match(system, /"Blue": "آبی"/);
});

test("zero-target days never masquerade as one hundred percent complete", () => {
  for (const path of [
    "components/pages/today/today-focus-card.tsx",
    "components/pages/today/today-smart-summary.tsx",
    "components/pages/today/today-metrics.tsx",
  ]) {
    const source = read(path);
    assert.doesNotMatch(source, /dailyTarget\s*===\s*0\s*\?\s*100/);
    assert.match(source, /hasTarget/);
  }
  assert.match(read("components/pages/today/today-smart-summary.tsx"), /t\("today\.summary\.noTargetWorkday"\)/);
});

test("today progress arc uses a stable dash-offset contract", () => {
  const source = read("components/pages/today/today-progress-arc.tsx");
  assert.match(source, /strokeDasharray="100"/);
  assert.match(source, /strokeDashoffset=\{100 - progress\}/);
  assert.doesNotMatch(source, /strokeDasharray=\{`\$\{progress\}/);
});

test("completed days present a final state instead of a disabled restart action", () => {
  const focus = read("components/pages/today/today-focus-card.tsx");
  const inputs = read("components/pages/today/time-strip/time-inputs.tsx");
  assert.match(focus, /t\("today\.focus\.dayRecorded"\)/);
  assert.match(focus, /t\("today\.focus\.daySaved"\)/);
  assert.doesNotMatch(focus, /شروع دوباره/);
  assert.match(inputs, /disabled=\{Boolean\(record\.start\)\}/);
});

test("shared page headings use the final dashboard surface language", () => {
  const heading = read("components/common/page-heading.tsx");
  assert.match(heading, /dashboard-card/);
  assert.match(heading, /var\(--dashboard-border\)/);
  assert.match(heading, /var\(--accent-soft\)/);
});
