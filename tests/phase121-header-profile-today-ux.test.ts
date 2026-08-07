import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { shiftDateKey } from "../lib/format.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("header promotes a real local profile menu while removing duplicate utility actions", async () => {
  const [header, actions, profile] = await Promise.all([
    read("components/layout/app-header.tsx"),
    read("components/layout/app-header/header-actions.tsx"),
    read("components/layout/app-header/profile-menu.tsx"),
  ]);
  assert.match(header, /<ProfileMenu/);
  assert.match(profile, /aria-haspopup="menu"/);
  assert.match(profile, /پروفایل محلی/);
  assert.match(profile, /settings-device-transfer/);
  assert.match(profile, /دانلود پشتیبان فوری/);
  assert.doesNotMatch(actions, /onSettings|onExport|<Settings|<Download/);
});

test("save status is contextual instead of a permanent header badge", async () => {
  const [status, persistence] = await Promise.all([
    read("components/layout/app-header/header-save-status.tsx"),
    read("hooks/use-persisted-app-data.ts"),
  ]);
  assert.match(status, /state === "idle"/);
  assert.match(status, /در حال ذخیره/);
  assert.match(status, /خطای ذخیره/);
  assert.match(persistence, /setTimeout\(\(\) => \{[\s\S]*setSaveState\("idle"\)[\s\S]*2600/);
});

test("workspace switcher explains the navigation impact of each mode", async () => {
  const source = await read("components/layout/app-header/workspace-switcher.tsx");
  assert.match(source, /فضای کاری · بخش‌های قابل دسترس را تغییر می‌دهد/);
  assert.match(source, /حضور، مرخصی و حقوق/);
  assert.match(source, /مشتری، پروژه و فاکتور/);
  assert.match(source, /هر دو فضای کاری/);
});

test("today hero exposes guarded previous and next day navigation", async () => {
  const [page, hero] = await Promise.all([
    read("components/pages/today/today-page.tsx"),
    read("components/pages/today/today-hero.tsx"),
  ]);
  assert.match(page, /onDateChange=\{\(date\) => requestNavigation/);
  assert.match(hero, /aria-label="روز قبل"/);
  assert.match(hero, /aria-label="روز بعد"/);
  assert.match(hero, /shiftDateKey\(selectedDate, -1\)/);
  assert.match(hero, /shiftDateKey\(selectedDate, 1\)/);
  assert.equal(shiftDateKey("2026-08-07", -1), "2026-08-06");
  assert.equal(shiftDateKey("2026-08-31", 1), "2026-09-01");
});

test("settings search and anchors shorten access to deep features", async () => {
  const [page, search, nav, model, profile, payroll, transfer] = await Promise.all([
    read("components/pages/settings/settings-page.tsx"),
    read("components/pages/settings/settings-search.tsx"),
    read("components/pages/settings/settings-nav.tsx"),
    read("components/pages/settings/settings-navigation-model.ts"),
    read("components/pages/settings/profile-settings-card.tsx"),
    read("components/pages/settings/payroll-policy-card.tsx"),
    read("components/pages/settings/device-transfer-card.tsx"),
  ]);
  assert.match(page, /<SettingsSearch/);
  assert.match(search, /جستجو در تنظیمات/);
  assert.match(search, /settingsNavItems/);
  assert.match(model, /settings-payroll/);
  assert.match(model, /settings-device-transfer/);
  assert.match(model, /settings-general[\s\S]*settings-data[\s\S]*settings-work[\s\S]*settings-about/);
  assert.match(nav, /settingsNavGroups/);
  assert.match(profile, /id="settings-profile"/);
  assert.match(payroll, /id="settings-payroll"/);
  assert.match(transfer, /id="settings-device-transfer"/);
});

test("phase 121 keeps new shell and UX modules within architecture limits and quality", async () => {
  for (const path of [
    "components/layout/app-header/profile-menu.tsx",
    "components/layout/app-header/header-save-status.tsx",
    "components/pages/today/today-hero.tsx",
    "components/pages/settings/settings-search.tsx",
  ]) {
    const source = await read(path);
    assert.ok(source.split("\n").length <= 250, `${path} exceeds 250 lines`);
  }
  const pkg = JSON.parse(await read("package.json"));
  assert.match(pkg.scripts.test, /tests\/phase121-header-profile-today-ux\.test\.ts/);
});
