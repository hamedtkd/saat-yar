import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import { normalizeOnboardingStep } from "../lib/onboarding-session.ts";
import { addOnboardingClient, addOnboardingProject, addOnboardingWorkspace } from "../lib/onboarding-workspace.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("onboarding progress now accepts the optional import step without breaking old saved steps", () => {
  assert.equal(normalizeOnboardingStep(1), 1);
  assert.equal(normalizeOnboardingStep("6"), 6);
  assert.equal(normalizeOnboardingStep(7), 7);
  assert.equal(normalizeOnboardingStep(8), 1);
});

test("progress labels are personalized for employee freelancer and hybrid workspaces", async () => {
  const progress = await read("components/layout/onboarding/steps-progress.tsx");
  assert.match(progress, /employee: \["Welcome", "Workspace", "Work schedule", "Payroll"/);
  assert.match(progress, /freelancer: \["Welcome", "Workspace", "Client", "Project name"/);
  assert.match(progress, /hybrid: \["Welcome", "Workspace", "Work schedule", "Combined income"/);
  assert.match(progress, /data-onboarding-progress-mode/);
  assert.match(progress, /flex w-full max-w-\[1120px\]/);
  assert.match(progress, /end-1\/2 top-\[18px\]/);
});

test("onboarding renders relevant step three and four content for each workspace", async () => {
  const onboarding = await read("components/layout/onboarding.tsx");
  assert.match(onboarding, /mode === "freelancer" \? <FreelancerClientStep/);
  assert.match(onboarding, /mode === "employee"/);
  assert.match(onboarding, /<PayrollStep/);
  assert.match(onboarding, /<FreelancerProjectStep/);
  assert.match(onboarding, /<HybridIncomeStep/);
  assert.match(onboarding, /data-onboarding-mode=\{mode\}/);
});

test("freelancer onboarding client creation is duplicate-safe", () => {
  const data = createInitialData();
  const first = addOnboardingClient(data, { name: "  استودیو آلفا  ", email: "hello@example.com" }, () => "client-1");
  assert.equal(first.created, true);
  assert.equal(first.data.clients[0].name, "استودیو آلفا");
  const duplicate = addOnboardingClient(first.data, { name: "استودیو   آلفا" }, () => "client-2");
  assert.equal(duplicate.created, false);
  assert.equal(duplicate.clientId, "client-1");
  assert.equal(duplicate.data.clients.length, 1);
});

test("freelancer onboarding project keeps the selected client relation and rate", () => {
  const data = createInitialData();
  const client = addOnboardingClient(data, { name: "آلفا" }, () => "client-1");
  const project = addOnboardingProject(client.data, { clientId: client.clientId, name: "وب‌سایت", rate: 925000, budgetHours: 48 }, () => "project-1");
  assert.equal(project.created, true);
  assert.equal(project.data.projects[0].clientId, "client-1");
  assert.equal(project.data.projects[0].rate, 925000);
  assert.equal(project.data.projects[0].budgetHours, 48);
  assert.equal(project.data.projects[0].billable, true);
});

test("hybrid quick setup can create a client and project atomically without touching employee settings", () => {
  const data = createInitialData();
  data.settings.salary = 42_000_000;
  const result = addOnboardingWorkspace(data, { clientName: "آلفا", projectName: "اپ", rate: 1_100_000, budgetHours: 60 }, (() => {
    const ids = ["client-1", "project-1"]; let index = 0; return () => ids[index++];
  })());
  assert.equal(result.clientId, "client-1");
  assert.equal(result.projectId, "project-1");
  assert.equal(result.data.settings.salary, 42_000_000);
  assert.equal(result.data.projects[0].rate, 1_100_000);
});

test("onboarding import reuses Phase 171 panels while preserving completion state until final submit", async () => {
  const [step, route] = await Promise.all([
    read("components/layout/onboarding/import-step.tsx"),
    read("app/onboarding/page.tsx"),
  ]);
  assert.match(step, /BackupImportPanel/);
  assert.match(step, /CsvImportPanel/);
  assert.match(step, /settings: \{ \.\.\.next\.settings, onboarded: data\.settings\.onboarded \}/);
  assert.match(step, /data-onboarding-import/);
  assert.match(route, /commitImport=\{controller\.commitImport\}/);
});

test("embedded import actions cannot submit the onboarding form before the explicit final action", async () => {
  const [backupPanel, csvPanel] = await Promise.all([
    read("components/pages/import/backup-import-panel.tsx"),
    read("components/pages/import/csv-import-panel.tsx"),
  ]);
  assert.match(backupPanel, /<Button type="button" disabled=\{busy\}/);
  assert.match(backupPanel, /<Button type="button" variant="destructive"/);
  assert.match(csvPanel, /<Button type="button" size="sm" variant="outline"/);
  assert.match(csvPanel, /<Button type="button" size="sm" variant="ghost"/);
  assert.match(csvPanel, /<Button type="button" data-import-apply/);
  assert.match(csvPanel, /<Button type="button" variant="ghost" disabled=\{busy\}/);
});

test("final onboarding step is seven and media/browser flows follow it", async () => {
  const [onboarding, footer, smoke, media] = await Promise.all([
    read("components/layout/onboarding.tsx"),
    read("components/layout/onboarding/onboarding-footer.tsx"),
    read("scripts/production-browser-smoke.mjs"),
    read("scripts/capture-product-media.mjs"),
  ]);
  assert.match(onboarding, /FINAL_STEP = 7/);
  assert.match(onboarding, /step === 7 && <ImportStep/);
  assert.match(footer, /FINAL_STEP = 7/);
  assert.match(smoke, /Personalized onboarding keeps employee setup relevant and imports existing data before completion/);
  assert.match(smoke, /onboarding Import persistence without premature completion/);
  assert.match(media, /index <= 7/);
});

test("Phase 173 is documented and advances the roadmap to i18n hardening", async () => {
  const [roadmap, notes, docs, pkg] = await Promise.all([
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/phases/PHASE_173_NOTES_FA.md"),
    read("docs/README.md"),
    read("package.json"),
  ]);
  assert.match(roadmap, /\[x\] فاز ۱۷۳: Onboarding شخصی‌شده/);
  assert.match(roadmap, /\[x\] فاز ۱۷۴:.*i18n/);
  assert.match(roadmap, /\[x\] فاز ۱۷۵:/);
  assert.match(notes, /Employee/);
  assert.match(notes, /Freelancer/);
  assert.match(notes, /Hybrid/);
  assert.match(docs, /PHASE_173_NOTES_FA\.md/);
  assert.match(pkg, /phase173-personalized-onboarding\.test\.ts/);
});
