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
  assert.match(leave, /b\("leave\.overview\.eyebrow"\)/);
  assert.match(clients, /b\("clients\.overview\.title"\)/);
  assert.match(projects, /b\("projects\.section\.eyebrow"\)/);
  assert.match(invoices, /b\("invoices\.section\.title"\)/);

  const catalog = await read("lib/i18n/business.ts");
  assert.match(catalog, /"leave\.overview\.eyebrow": "وضعیت سهمیه"/);
  assert.match(catalog, /"clients\.overview\.title": "وضعیت کسب‌وکار"/);
  assert.match(catalog, /"projects\.section\.eyebrow": "پرتفوی پروژه"/);
  assert.match(catalog, /"invoices\.section\.title": "فهرست فاکتورها"/);
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

test("report charts use one responsive grid with a print-aware section", async () => {
  const chartShell = await read("components/pages/reports/charts/chart-shell.tsx");
  const reports = await read("components/pages/reports/reports-page.tsx");

  assert.doesNotMatch(chartShell, /print:hidden/);
  assert.match(reports, /className="report-print-section report-print-charts mb-5"/);
  assert.match(reports, /<ReportCharts mode=\{mode\}/);
  assert.doesNotMatch(reports, /<div className="report-charts">/);
});

test("phase 107 closes the remaining page design-freeze backlog item", async () => {
  const backlog = await read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /- \[x\] انتقال زبان طراحی نهایی به مرخصی، مشتری‌ها، پروژه‌ها و فاکتورها\./);
});

test("phase 107 contract is part of the main quality command", async () => {
  const pkg = JSON.parse(await read("package.json")) as { scripts: { test: string } };
  assert.match(pkg.scripts.test, /tests\/phase107-business-pages-design-freeze\.test\.ts/);
});
