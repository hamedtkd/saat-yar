import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { formatLocaleDurationWords, formatLocaleNumber } from "../lib/i18n/formatters.ts";
import { faSystemCatalog, translateSystem } from "../lib/i18n/system.ts";
import { getDeviceTransferSessionView } from "../lib/device-transfer-session-ui.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

async function readSourceTree(root: string) {
  const entries = await readdir(new URL(`../${root}`, import.meta.url), { recursive: true });
  const files = entries.filter((entry) => /\.(ts|tsx)$/.test(entry));
  return Promise.all(files.map(async (entry) => ({ path: `${root}/${entry}`, source: await read(`${root}/${entry}`) })));
}

test("system catalog keeps Persian defaults, English keys, and parameter interpolation", async () => {
  assert.equal(translateSystem("en", "Initial setup"), "Initial setup");
  assert.equal(translateSystem("fa-IR", "Initial setup"), "راه‌اندازی اولیه");
  assert.equal(translateSystem("en", "Transfer from {device} is ready to review", { device: "Laptop" }), "Transfer from Laptop is ready to review");
  assert.equal(translateSystem("fa-IR", "{current} of {total} frames received", { current: 2, total: 4 }), "2 از 4 فریم دریافت شد");
  assert.ok(Object.keys(faSystemCatalog).length > 700);
  const systemSource = await read("lib/i18n/system.ts");
  assert.match(systemSource, /let message: string = locale === "en" \? key : faSystemCatalog\[key\]/);
});

test("system locale facade remains memoized across ordinary rerenders", async () => {
  const source = await read("components/i18n/use-system-ui.ts");
  assert.match(source, /import \{ useMemo \} from "react"/);
  assert.match(source, /const ui = useLocaleUi\(\)/);
  assert.match(source, /return useMemo\(\(\) => \(\{/);
  assert.match(source, /\}\), \[ui\]\);/);
});

test("Onboarding and Import use system locale UI without Persian interface literals", async () => {
  const trees = (await Promise.all([
    readSourceTree("components/layout/onboarding"),
    readSourceTree("components/pages/import"),
  ])).flat();
  const joined = trees.map((item) => item.source).join("\n");
  assert.match(joined, /useSystemUi/);
  assert.match(joined, /s\("Welcome to Saatyar"\)/);
  assert.match(joined, /s\("Import files"\)/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);

  const [backupPanel, csvPanel] = await Promise.all([
    read("components/pages/import/backup-import-panel.tsx"),
    read("components/pages/import/csv-import-panel.tsx"),
  ]);
  assert.match(backupPanel, /type="button"/);
  assert.match(csvPanel, /data-import-apply/);
  assert.match(csvPanel, /type="button"/);
});

test("Settings source tree is catalog-driven and navigation has no parallel Persian labels", async () => {
  const tree = await readSourceTree("components/pages/settings");
  const joined = tree.map((item) => item.source).join("\n");
  const model = await read("components/pages/settings/settings-navigation-model.ts");
  assert.match(joined, /useSystemUi/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);
  assert.doesNotMatch(model, /\blabel:\s*"/);
  assert.doesNotMatch(model, /\bgroup:\s*"/);
  assert.match(model, /keywords: "qr webrtc transfer device phone laptop sync pairing"/);
  const scheduleEditor = await read("components/pages/settings/work-schedule-editor.tsx");
  assert.match(scheduleEditor, /saturday: "Saturday"/);
  assert.match(scheduleEditor, /friday: "Friday"/);
  assert.doesNotMatch(scheduleEditor, /\bsat:\s*"Saturday"/);
});

test("About, PWA and multi-tab surfaces use the system catalog", async () => {
  const sources = await Promise.all([
    read("components/pages/about/about-page.tsx"),
    read("components/pwa/pwa-experience.tsx"),
    read("components/layout/multi-tab-sync-banner.tsx"),
  ]);
  const joined = sources.join("\n");
  assert.match(joined, /useSystemUi/);
  assert.match(joined, /s\("About and guide"\)/);
  assert.match(joined, /s\("Install Saatyar like an app"\)/);
  assert.match(joined, /s\("Data changed in another tab"\)/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);
});

test("runtime persistence, backup, attendance, multi-tab and notification copy follows the active browser locale", async () => {
  const files = [
    "hooks/controller/use-attendance-actions.ts",
    "hooks/controller/use-backup-actions.ts",
    "hooks/controller/use-notification-reminders.ts",
    "hooks/use-persisted-app-data.ts",
    "hooks/use-multi-tab-data-sync.ts",
    "hooks/use-saatyar-controller.ts",
  ];
  const sources = await Promise.all(files.map(read));
  const joined = sources.join("\n");
  assert.match(joined, /getBrowserLocale\(\)/);
  assert.match(joined, /translateSystem\(getBrowserLocale\(\)/);
  assert.match(joined, /"Saatyar timer is still running"/);
  assert.match(joined, /"Backup file downloaded\."/);
  assert.match(joined, /"Timer control is active in another tab\."/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);
});

test("device transfer helpers and UI remain locale-aware with Persian compatibility defaults", async () => {
  assert.equal(getDeviceTransferSessionView("idle", "idle", "en").label, "Ready to pair");
  assert.equal(getDeviceTransferSessionView("idle", "idle").label, "آماده Pairing");
  const [card, preview, history, steps, pairingHook, qr] = await Promise.all([
    read("components/pages/settings/device-transfer-card.tsx"),
    read("components/pages/settings/device-transfer-preview.tsx"),
    read("components/pages/settings/device-transfer-history.tsx"),
    read("components/pages/settings/device-transfer-steps.tsx"),
    read("hooks/use-device-transfer-pairing.ts"),
    read("lib/device-pairing-qr.ts"),
  ]);
  const joined = [card, preview, history, steps].join("\n");
  assert.match(joined, /useSystemUi/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);
  assert.match(pairingHook, /createLocalDeviceSource\(locale\)/);
  assert.match(qr, /locale: Locale = "fa-IR"/);
});

test("locale formatters support readable duration words and configurable number precision", () => {
  assert.equal(formatLocaleDurationWords("fa-IR", 636), "۱۰ ساعت و ۳۶ دقیقه");
  assert.equal(formatLocaleDurationWords("en", 636), "10 hours and 36 minutes");
  assert.equal(formatLocaleNumber("en", 12.345, { maximumFractionDigits: 1 }), "12.3");
  assert.equal(formatLocaleNumber("fa-IR", 12.345, { maximumFractionDigits: 1 }), "۱۲٫۳");
});

test("toast tone detection supports English system messages without losing Persian compatibility", async () => {
  const source = await read("components/common/app-toast.tsx");
  assert.match(source, /"saved"/);
  assert.match(source, /"failed"/);
  assert.match(source, /"conflict"/);
  assert.match(source, /text-start/);
  assert.match(source, /"ذخیره شد"/);
});

test("locale runtime updates route titles while published static metadata remains canonical Persian", async () => {
  const [runtime, metadata, manifest] = await Promise.all([
    read("components/i18n/locale-runtime.tsx"),
    read("lib/site-metadata.ts"),
    read("app/manifest.ts"),
  ]);
  assert.match(runtime, /usePathname/);
  assert.match(runtime, /document\.title/);
  assert.match(runtime, /MutationObserver/);
  assert.match(runtime, /expectedTitle/);
  assert.match(runtime, /pathname === "\/import"/);
  assert.match(runtime, /"nav\.today"/);
  assert.match(metadata, /SITE_NAME = "ساعت‌یار"/);
  assert.match(metadata, /locale: "fa_IR"/);
  assert.match(manifest, /SITE_NAME/);
});

test("production browser smoke covers English Settings Import About and onboarding reentry before Persian restore", async () => {
  const smoke = await read("scripts/production-browser-smoke.mjs");
  const workspaceSwitcher = await read("components/layout/app-header/workspace-switcher.tsx");
  assert.match(workspaceSwitcher, /data-workspace-switch-trigger/);
  assert.match(workspaceSwitcher, /data-workspace-mode=\{mode\}/);
  assert.match(workspaceSwitcher, /<SelectItem value="hybrid"><span data-workspace-mode-option="hybrid">/);
  assert.match(smoke, /await switchWorkspaceMode\(client, "hybrid"\)/);
  assert.match(smoke, /await switchWorkspaceMode\(client, "employee"\)/);
  assert.match(smoke, /RouteGuard remains authoritative/);
  assert.match(smoke, /English Settings profile surface/);
  assert.match(smoke, /English Settings sync surface/);
  assert.match(smoke, /English notification intelligence settings/);
  assert.match(smoke, /English privacy-safe analytics settings/);
  assert.match(smoke, /English Google Calendar opt-in settings/);
  assert.match(smoke, /Settings is split into focused Profile, Sync, Notifications, Privacy, and Integrations routes/);
  assert.match(smoke, /#settings-onboarding/);
  assert.match(smoke, /#settings-device-transfer/);
  assert.match(smoke, /title: document\.title/);
  assert.ok(smoke.includes(String.raw`replace(/\\s+/g`));
  assert.match(smoke, /English Import system surface/);
  assert.match(smoke, /English About system surface/);
  assert.match(smoke, /data-onboarding-reentry-action/);
  assert.match(smoke, /data-onboarding-back-settings/);
  assert.match(smoke, /Settings, Onboarding, Import, and About follow English LTR before Persian restore/);
  assert.match(smoke, /Persian RTL locale restore/);
});

test("Phase 177 is documented and wired without schema dependency or release-version changes", async () => {
  const [pkgSource, notes, backlog, docs, schema] = await Promise.all([
    read("package.json"),
    read("docs/phases/PHASE_177_NOTES_FA.md"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/README.md"),
    read("lib/data/version.ts"),
  ]);
  const pkg = JSON.parse(pkgSource) as { version: string; dependencies: Record<string, string>; devDependencies: Record<string, string>; scripts: Record<string, string> };
  assert.match(pkg.scripts.test, /phase177-i18n-system-settings\.test\.ts/);
  assert.match(notes, /Package: `2\.3\.2`/);
  assert.match(notes, /AppData Schema: `v17`/);
  assert.match(notes, /Migration: ندارد/);
  assert.match(notes, /Dependency جدید: ندارد/);
  assert.match(backlog, /\[x\] فاز ۱۷۷:/);
  assert.match(backlog, /\[x\] فاز ۱۷۸:/);
  assert.match(docs, /PHASE_177_NOTES_FA\.md/);
  assert.match(schema, /APP_DATA_SCHEMA_VERSION = 19/);
});
