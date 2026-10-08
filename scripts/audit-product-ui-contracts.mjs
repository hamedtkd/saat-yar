import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

async function source(path) {
  return readFile(resolve(ROOT, path), "utf8");
}

async function walk(directory) {
  const entries = await readdir(resolve(ROOT, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

function requireMatch(path, text, pattern, label) {
  if (!pattern.test(text)) failures.push(`${path}: missing ${label}`);
}

async function auditAppearanceContracts() {
  const runtimePath = "components/theme/theme-runtime.tsx";
  const bootstrapPath = "components/theme/theme-bootstrap.tsx";
  const cardPath = "components/pages/settings/appearance/appearance-settings-card.tsx";
  const previewPath = "components/pages/settings/appearance/theme-preview.tsx";
  const sidebarPath = "components/layout/navigation/sidebar-nav.tsx";
  const globalsPath = "app/globals.css";
  const [runtime, bootstrap, card, preview, sidebar, globals] = await Promise.all([
    source(runtimePath), source(bootstrapPath), source(cardPath), source(previewPath), source(sidebarPath), source(globalsPath),
  ]);

  requireMatch(runtimePath, runtime, /setProperty\("--app-body-font-fa", appearanceFontStack\(safe\.bodyFont, "fa"\)\)/, "Persian body font runtime binding");
  requireMatch(runtimePath, runtime, /setProperty\("--app-heading-font-fa", appearanceFontStack\(safe\.headingFont, "fa"\)\)/, "Persian heading font runtime binding");
  requireMatch(bootstrapPath, bootstrap, /--app-body-font-fa/, "early Persian body font binding");
  requireMatch(bootstrapPath, bootstrap, /--app-heading-font-fa/, "early Persian heading font binding");
  requireMatch(globalsPath, globals, /:root\[lang="fa"\] \.saatyar-app-font \{[\s\S]*?font-family: var\(--app-body-font-fa\)/, "Persian body font CSS contract");
  requireMatch(globalsPath, globals, /:root\[lang="fa"\] \.saatyar-app-font :is\(h1, h2, h3, h4, h5, h6\) \{[\s\S]*?font-family: var\(--app-heading-font-fa\)/, "Persian heading font CSS contract");
  for (const [pattern, label] of [
    [/APPEARANCE_FONT_OPTIONS/, "body font selector"],
    [/HEADING_FONT_OPTIONS/, "heading font selector"],
    [/s\("Sidebar style"\)/, "sidebar style control"],
    [/s\("Active menu item"\)/, "active menu accent control"],
    [/s\("Sidebar width"\)/, "sidebar width control"],
    [/"none", "compact", "balanced", "rounded", "extra"/, "complete radius options"],
  ]) requireMatch(cardPath, card, pattern, label);
  requireMatch(previewPath, preview, /data-sidebar-style/, "sidebar preview style binding");
  requireMatch(previewPath, preview, /--preview-sidebar-width/, "sidebar preview width binding");
  requireMatch(runtimePath, runtime, /root\.dataset\.sidebarStyle/, "runtime sidebar style binding");
  requireMatch(sidebarPath, sidebar, /var\(--sidebar-background\)/, "sidebar semantic background token");
  requireMatch(sidebarPath, sidebar, /var\(--sidebar-active-bg\)/, "sidebar semantic active token");
  requireMatch(globalsPath, globals, /data-radius="none"/, "zero-radius style");
  requireMatch(globalsPath, globals, /data-sidebar-width="wide"/, "wide sidebar style");

  const appFiles = [...await walk("app"), ...await walk("components")];
  const fixedRadius = /rounded-\[\d+px\]|\brounded-(?:sm|md|lg|xl|2xl|3xl)\b|\brounded-(?:t|b|s|e)-(?:sm|md|lg|xl|2xl|3xl)\b/g;
  const paddedFullRadius = /(?:rounded-full[^"'`\n]*\bpx-|\bpx-[^"'`\n]*rounded-full)/g;
  for (const path of appFiles) {
    const text = await source(path);
    const fixed = text.match(fixedRadius);
    if (fixed?.length) failures.push(`${path}: fixed radius bypasses ${fixed.join(", ")}`);
    const padded = text.replace(/\[[^\]]+\]:rounded-full/g, "").match(paddedFullRadius);
    if (padded?.length) failures.push(`${path}: padded circular radius bypasses ${padded.join(", ")}`);
  }
}

async function auditReportPrintContracts() {
  const cssPath = "app/globals.css";
  const reportPath = "components/pages/reports/reports-page.tsx";
  const tablePath = "components/pages/reports/table/employee-desktop-table.tsx";
  const chartPath = "components/pages/reports/charts/chart-shell.tsx";
  const [css, report, table, chart] = await Promise.all([source(cssPath), source(reportPath), source(tablePath), source(chartPath)]);
  requireMatch(cssPath, css, /@page \{ size: A4 landscape/, "A4 landscape print page");
  requireMatch(cssPath, css, /\.report-page \.report-mobile-cards \{ display: none !important; \}/, "mobile report-card print hiding");
  requireMatch(cssPath, css, /table-layout: fixed !important/, "fixed print table layout");
  requireMatch(cssPath, css, /\.report-page \.report-charts \{\s*display: block !important;/, "single-column print charts");
  requireMatch(cssPath, css, /\.report-page \.report-charts > article \{[\s\S]*?width: 100% !important;[\s\S]*?break-inside: avoid-page;/, "chart cards stay whole in print");
  if (/\.report-charts \{ display: none/.test(css)) failures.push(`${cssPath}: report charts must remain visible in print`);
  requireMatch(reportPath, report, /<ReportPrintHeader/, "report print header");
  requireMatch(reportPath, report, /data-report-print-root/, "report print root");
  requireMatch(reportPath, report, /report-print-charts/, "report chart print section");
  if (/print:hidden/.test(chart)) failures.push(`${chartPath}: charts must remain available to print`);
  requireMatch(tablePath, table, /report-desktop-table/, "desktop table print surface");
}

await auditAppearanceContracts();
await auditReportPrintContracts();
if (failures.length) {
  console.error("Product UI source-contract audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Product UI source-contract audit passed (appearance and report print contracts).");
}
