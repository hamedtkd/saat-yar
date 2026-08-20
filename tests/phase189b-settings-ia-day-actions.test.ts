import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const settingsRouteIds = ["profile", "appearance", "work", "payroll", "notifications", "integrations", "data", "sync", "privacy"] as const;

test("weekly chart explanation moved into the shared description tooltip", async () => {
  const source = await read("components/pages/month/weekly-chart.tsx");
  assert.match(source, /DescriptionTooltip content=\{t\("month\.weekly\.note"\)\}/);
  assert.doesNotMatch(source, /<p[^>]*>\s*<Info/);
});

test("month calendar replaces the native context menu with keyboard-accessible day quick actions", async () => {
  const calendar = await read("components/pages/month/month-calendar.tsx");
  assert.match(calendar, /onContextMenu=\{\(event\) =>/);
  assert.match(calendar, /event\.preventDefault\(\)/);
  assert.match(calendar, /event\.key === "ContextMenu"/);
  assert.match(calendar, /event\.shiftKey && event\.key === "F10"/);
  assert.match(calendar, /aria-haspopup=\{onOpenDayActions \? "menu"/);
});

test("day quick menu exposes event CRUD and manual holiday or workday overrides", async () => {
  const source = await read("components/pages/month/month-day-quick-menu.tsx");
  assert.match(source, /data-month-day-quick-menu/);
  assert.match(source, /CalendarEventDialog/);
  assert.match(source, /CalendarEventDeleteDialog/);
  assert.match(source, /integration\.createEvent/);
  assert.match(source, /integration\.deleteEvent/);
  assert.match(source, /normalizeHolidayOverrides/);
  assert.match(source, /markHoliday/);
  assert.match(source, /markWorkday/);
  assert.match(source, /resetHolidayRule/);
});

test("month route provides mutation and toast contracts to quick day actions", async () => {
  const [route, page] = await Promise.all([read("app/month/page.tsx"), read("components/pages/month/month-page.tsx")]);
  assert.match(route, /setData=\{controller\.setData\}/);
  assert.match(route, /setToast=\{controller\.setToast\}/);
  assert.match(page, /MonthDayQuickMenu/);
  assert.match(page, /id="month-selected-day-section"/);
});

test("Settings root is an overview and heavy settings are split into focused static routes", async () => {
  const root = await read("app/settings/page.tsx");
  assert.match(root, /route="overview"/);
  for (const route of settingsRouteIds) {
    const source = await read(`app/settings/${route}/page.tsx`);
    assert.match(source, new RegExp(`route="${route}"`));
  }
  const page = await read("components/pages/settings/settings-page.tsx");
  assert.match(page, /SettingsOverview/);
  assert.match(page, /props\.route === "integrations"/);
  assert.match(page, /props\.route === "sync"/);
});

test("Settings navigation and search share route-aware destinations while keeping unsaved guards", async () => {
  const [model, nav, search] = await Promise.all([
    read("components/pages/settings/settings-navigation-model.ts"),
    read("components/pages/settings/settings-nav.tsx"),
    read("components/pages/settings/settings-search.tsx"),
  ]);
  assert.match(model, /href: "\/settings\/integrations"/);
  assert.match(model, /href: "\/settings\/payroll"/);
  assert.match(nav, /useSyncExternalStore\(subscribeToSettingsPosition/);
  assert.match(nav, /requestNavigation\(\(\) => navigateTo/);
  assert.match(nav, /router\.push\(`\$\{item\.href\}#\$\{item\.id\}`\)/);
  assert.match(search, /router\.push\(`\$\{item\.href\}#\$\{item\.id\}`\)/);
});

test("settings subroutes remain one allowed app tab across shell locale and sync after analytics simplification", async () => {
  const [navigation, navItems, localeRuntime, cloudflare, sync] = await Promise.all([
    read("lib/navigation.ts"),
    read("components/layout/app-header/nav-items.ts"),
    read("components/i18n/locale-runtime.tsx"),
    read("components/analytics/cloudflare-web-analytics.tsx"),
    read("lib/multi-tab-sync.ts"),
  ]);
  assert.match(navigation, /normalized\.startsWith\("\/settings\/"\)/);
  assert.match(navItems, /normalized\.startsWith\(`\$\{settingsNavItem\.href\}\/`\)/);
  assert.match(localeRuntime, /pathname\.startsWith\("\/settings\/"\)/);
  assert.doesNotMatch(cloudflare, /pathname|settings\//);
  assert.match(sync, /path\.startsWith\("\/settings\/"\)/);
});


test("Phase 189B is browser-covered documented and remains schema and dependency neutral", async () => {
  const [pkg, smoke, backlog, notes] = await Promise.all([
    read("package.json"),
    read("scripts/production-browser-smoke.mjs"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/phases/PHASE_189B_NOTES_FA.md"),
  ]);
  assert.match(pkg, /tests\/phase189b-settings-ia-day-actions\.test\.ts/);
  assert.match(smoke, /Settings is split into focused Profile, Sync, Notifications, Privacy, and Integrations routes/);
  assert.match(smoke, /#settings-profile/);
  assert.match(smoke, /data-settings-language/);
  const localeSwitchBlock = smoke.slice(
    smoke.indexOf("English LTR locale switch with automatic Gregorian calendar") - 700,
    smoke.indexOf("English locale persistence after reload with automatic Gregorian calendar") + 100,
  );
  assert.doesNotMatch(localeSwitchBlock, /Settings & data/);
  assert.match(backlog, /\[x\] فاز ۱۸۹B/);
  assert.match(notes, /Schema v19/);
  assert.match(notes, /بدون dependency جدید/);
});
