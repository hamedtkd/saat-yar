import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildFreelancerPersistenceProbeExpression } from "../scripts/freelancer-persistence-expression.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const params = {
  clientName: "مشتری مرورگر",
  projectName: "پروژه مرورگر",
  expenseName: "هزینه مرورگر",
  invoiceDescription: "خدمات مرورگر",
};

test("freelancer persistence probe compiles before CDP evaluation", () => {
  const expression = buildFreelancerPersistenceProbeExpression(params);
  assert.doesNotThrow(() => new Function(`return (${expression});`));
});

test("persistence probe unwraps the real AppData snapshot envelope", () => {
  const expression = buildFreelancerPersistenceProbeExpression(params);
  assert.match(expression, /stored\.format === "saatyar-app-data"/);
  assert.match(expression, /const data = envelope \? envelope\.data : stored/);
  assert.match(expression, /schemaVersion: envelope\?\.schemaVersion/);
});

test("invoice durability follows the current lines contract instead of obsolete items", () => {
  const expression = buildFreelancerPersistenceProbeExpression(params);
  assert.match(expression, /item\.lines\?\.some/);
  assert.doesNotMatch(expression, /item\.items/);
  assert.match(expression, /timeEntries/);
  assert.match(expression, /expenses/);
  assert.match(expression, /invoices/);
});

test("phase 140 wires the probe into browser smoke and documents reload durability", () => {
  const smoke = read("scripts/freelancer-browser-ux-smoke.mjs");
  const pkg = read("package.json");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_140_NOTES_FA.md");
  assert.match(smoke, /buildFreelancerPersistenceProbeExpression/);
  assert.match(smoke, /Hard reload restores the persisted freelancer invoice/);
  assert.match(pkg, /phase140-persistence-envelope-contract\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۰:/);
  assert.match(notes, /snapshot envelope/i);
  assert.match(notes, /AppData Schema: v17/);
});
