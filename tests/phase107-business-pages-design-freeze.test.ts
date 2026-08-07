import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(path, "utf8");

test("leave clients projects and invoices share the final section hierarchy", async () => {
  const [leave, clients, projects, invoices] = await Promise.all([
    read("components/pages/leave/leave-page.tsx"),
    read("components/pages/clients/clients-page.tsx"),
    read("components/pages/projects/projects-page.tsx"),
    read("components/pages/invoices/invoices-page.tsx"),
  ]);

  for (const source of [leave, clients, projects, invoices]) {
    assert.match(source, /SectionHeading/);
    assert.match(source, /PageHeading/);
  }
  assert.match(leave, /وضعیت سهمیه/);
  assert.match(clients, /وضعیت کسب‌وکار/);
  assert.match(projects, /پرتفوی پروژه/);
  assert.match(invoices, /فهرست فاکتورها/);
});

test("business forms and project detail use shared semantic dashboard surfaces", async () => {
  const [leaveForm, leaveTable, clientForm, projectForm, projectHeader, invoiceForm] = await Promise.all([
    read("components/pages/leave/leave-form.tsx"),
    read("components/pages/leave/leave-table.tsx"),
    read("components/pages/clients/client-form.tsx"),
    read("components/pages/projects/project-form.tsx"),
    read("components/pages/projects/detail/project-header.tsx"),
    read("components/pages/invoices/form/invoice-form.tsx"),
  ]);

  for (const source of [leaveForm, leaveTable, clientForm, projectForm, projectHeader, invoiceForm]) {
    assert.match(source, /SurfaceCard/);
  }
  assert.doesNotMatch(projectHeader, /bg-(green|blue|cyan|teal)-/);
  assert.match(projectHeader, /var\(--accent-soft\)/);
});

test("report print regression checks containment instead of an obsolete contiguous class string", async () => {
  const testSource = await read("tests/phase52-dashboard-report-polish.test.ts");
  const reports = await read("components/pages/reports/reports-page.tsx");

  assert.doesNotMatch(testSource, /report-charts print:hidden/);
  assert.match(testSource, /print:hidden/);
  assert.match(testSource, /report-charts/);
  assert.match(reports, /<section className="[^"]*print:hidden[^"]*">[\s\S]*?<div className="report-charts">/);
});

test("phase 107 closes the remaining page design-freeze backlog item", async () => {
  const backlog = await read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /- \[x\] انتقال زبان طراحی نهایی به مرخصی، مشتری‌ها، پروژه‌ها و فاکتورها\./);
});

test("phase 107 contract is part of the main quality command", async () => {
  const pkg = JSON.parse(await read("package.json")) as { scripts: { test: string } };
  assert.match(pkg.scripts.test, /tests\/phase107-business-pages-design-freeze\.test\.ts/);
});
