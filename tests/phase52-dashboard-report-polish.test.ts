import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildGreeting, getGreetingPeriod } from "../lib/greeting.ts";

test("greeting follows local day periods and includes the saved name", () => {
  assert.equal(getGreetingPeriod(8), "صبح");
  assert.equal(getGreetingPeriod(13), "ظهر");
  assert.equal(getGreetingPeriod(18), "عصر");
  assert.equal(getGreetingPeriod(22), "شب");
  assert.equal(buildGreeting("حامد", 8), "صبح بخیر، حامد");
});

test("settings navigation stays sticky on desktop", async () => {
  const source = await readFile("components/pages/settings/settings-nav.tsx", "utf8");
  assert.match(source, /sticky top-\[84px\]/);
  assert.match(source, /max-\[900px\]:top-\[72px\]/);
  assert.match(source, /max-\[900px\]:grid/);
  assert.match(source, /overflow-x-auto/);
});

test("employee notes use a textarea and the today title greets the user", async () => {
  const focus = await readFile("components/pages/today/today-focus-card.tsx", "utf8");
  const hero = await readFile("components/pages/today/today-hero.tsx", "utf8");
  assert.match(focus, /<Textarea/);
  assert.match(focus, /t\("today\.focus\.employeeNote"\)/);
  assert.match(hero, /buildLocalizedGreeting\(data\.settings\.name, locale\)/);
});

test("printed reports hide interactive charts and use A4-safe layout", async () => {
  const css = await readFile("app/globals.css", "utf8");
  const reports = await readFile("components/pages/reports/reports-page.tsx", "utf8");
  assert.match(css, /@page \{ size: A4/);
  assert.match(css, /\.report-charts/);
  assert.match(css, /break-inside: avoid/);
  assert.match(reports, /<section className="[^"]*print:hidden[^"]*">[\s\S]*?<div className="report-charts">/);
});
