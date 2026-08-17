import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(path, "utf8");

test("shared form dialogs use the official Radix Dialog primitive", async () => {
  const [pkgText, lockText, dialog] = await Promise.all([
    read("package.json"),
    read("package-lock.json"),
    read("components/ui/dialog.tsx"),
  ]);
  const pkg = JSON.parse(pkgText);
  const lock = JSON.parse(lockText);
  assert.equal(pkg.dependencies["@radix-ui/react-dialog"], "^1.1.23");
  assert.equal(lock.packages["node_modules/@radix-ui/react-dialog"]?.version, "1.1.23");
  assert.match(dialog, /@radix-ui\/react-dialog/);
  assert.match(dialog, /DialogPrimitive\.Content/);
  assert.match(dialog, /DialogPrimitive\.Close/);
});

test("project form can create and auto-select a client without leaving the form", async () => {
  const form = await read("components/pages/projects/project-form.tsx");
  const quick = await read("components/pages/clients/quick-client-dialog.tsx");
  assert.match(form, /QuickClientDialog/);
  assert.match(form, /onCreated=\{selectClient\}/);
  assert.match(form, /activeClients\.length > 0/);
  assert.match(form, /b\("projects\.form\.noClient"\)/);
  assert.match(quick, /b\("common\.saveAndSelect"\)/);
  assert.match(quick, /onCreated\(id\)/);
});

test("client list can create a project already linked to that client", async () => {
  const table = await read("components/pages/clients/clients-table.tsx");
  const quick = await read("components/pages/projects/quick-project-dialog.tsx");
  assert.match(table, /QuickProjectDialog client=\{client\}/);
  assert.match(quick, /clientId: client\.id/);
  assert.match(quick, /b\("projects\.quick\.title", \{ client: client\.name \}\)/);
  assert.match(quick, /b\("projects\.quick\.description"\)/);
});

test("business actions expose reusable create functions instead of duplicating persistence", async () => {
  const source = await read("hooks/controller/use-business-actions.ts");
  assert.match(source, /function createClient\(draft: ClientDraft/);
  assert.match(source, /function createProject\(draft: ProjectDraft/);
  assert.match(source, /function addClient\(\)[\s\S]*createClient\(clientDraft/);
  assert.match(source, /function addProject\(\)[\s\S]*createProject\(projectDraft/);
  assert.match(source, /return \{[^}]*createClient[^}]*createProject/);
});

test("legacy settings density test follows the compact mobile settings picker", async () => {
  const phase52 = await read("tests/phase52-dashboard-report-polish.test.ts");
  assert.match(phase52, /collapses to the compact mobile picker/);
  assert.match(phase52, /data-settings-mobile-trigger/);
  assert.match(phase52, /hidden max-\\\[900px\\\]:block/);
  assert.match(phase52, /doesNotMatch\(mobile, \/overflow-x-auto\//);
});

test("phase 129 is wired into quality and roadmap marks the inline relation foundation complete", async () => {
  const [pkg, backlog] = await Promise.all([read("package.json"), read("docs/roadmap/BACKLOG_FA.md")]);
  assert.match(pkg, /tests\/phase129-inline-related-entity-creation\.test\.ts/);
  assert.match(backlog, /\[x\] فاز ۱۲۹:/);
  assert.match(backlog, /Project.*Client|Client.*Project/i);
});
