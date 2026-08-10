import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getHtmlLang,
  getLocaleDirection,
  normalizeLocale,
  readStoredLocale,
  translate,
} from "../lib/i18n/index.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("locale normalization keeps Persian as the safe default and English as the only alternate", () => {
  assert.equal(DEFAULT_LOCALE, "fa-IR");
  assert.equal(normalizeLocale("fa-IR"), "fa-IR");
  assert.equal(normalizeLocale("en"), "en");
  assert.equal(normalizeLocale("en-US"), "fa-IR");
  assert.equal(normalizeLocale(null), "fa-IR");
  assert.equal(getLocaleDirection("fa-IR"), "rtl");
  assert.equal(getLocaleDirection("en"), "ltr");
  assert.equal(getHtmlLang("fa-IR"), "fa");
  assert.equal(getHtmlLang("en"), "en");
});

test("typed catalogs translate shared shell messages and interpolate parameters", () => {
  assert.equal(translate("fa-IR", "nav.today"), "امروز");
  assert.equal(translate("en", "nav.today"), "Today");
  assert.equal(translate("fa-IR", "app.personalSpace", { name: "حامد" }), "فضای شخصی حامد");
  assert.equal(translate("en", "profile.aria", { name: "Hamed" }), "Profile for Hamed");
});

test("locale persistence is a separate local-first preference outside AppData", () => {
  assert.equal(LOCALE_STORAGE_KEY, "saatyar-locale-v1");
  const storage = { getItem: (key: string) => key === LOCALE_STORAGE_KEY ? "en" : null };
  assert.equal(readStoredLocale(storage), "en");
  const store = read("lib/i18n/locale-store.ts");
  assert.match(store, /localStorage\.setItem\(LOCALE_STORAGE_KEY, locale\)/);
  assert.doesNotMatch(store, /AppData|setData|schemaVersion/);
});

test("locale provider uses one external store without polling or persistence side effects", () => {
  const provider = read("components/i18n/locale-provider.tsx");
  assert.match(provider, /useSyncExternalStore\(subscribeBrowserLocale, getBrowserLocale/);
  assert.doesNotMatch(provider, /setInterval|setTimeout|indexedDB|fetch\(/);
});

test("bootstrap and runtime apply html language and direction before and after hydration", () => {
  const layout = read("app/layout.tsx");
  const bootstrap = read("components/i18n/locale-bootstrap.tsx");
  const runtime = read("components/i18n/locale-runtime.tsx");
  assert.match(layout, /<LocaleBootstrap \/>/);
  assert.match(layout, /<LocaleProvider>/);
  assert.match(layout, /<LocaleRuntime \/>/);
  assert.match(bootstrap, /localStorage\.getItem/);
  assert.match(bootstrap, /r\.dir=e\?'ltr':'rtl'/);
  assert.match(runtime, /root\.lang = getHtmlLang\(locale\)/);
  assert.match(runtime, /root\.dir = direction/);
});

test("shell navigation translates shared labels and flips desktop geometry with document direction", () => {
  const sidebar = read("components/layout/navigation/sidebar-nav.tsx");
  const mobile = read("components/layout/navigation/mobile-bottom-nav.tsx");
  const header = read("components/layout/app-header.tsx");
  const css = read("app/globals.css");
  assert.match(sidebar, /className="fixed inset-y-2 start-2/);
  assert.match(sidebar, /t\("nav\.main"\)/);
  assert.match(mobile, /t\("nav\.mobileAria"\)/);
  assert.match(header, /t\(routeItem\.labelKey\)/);
  assert.match(css, /:root\[dir="ltr"\] \.shell-main-offset/);
  assert.match(css, /margin-left: calc\(var\(--shell-content-offset\)/);
});

test("settings exposes an immediate language control without touching settings drafts", () => {
  const card = read("components/pages/settings/language-settings-card.tsx");
  const page = read("components/pages/settings/settings-page.tsx");
  const model = read("components/pages/settings/settings-navigation-model.ts");
  assert.match(card, /data-locale-choice=\{choice\.locale\}/);
  assert.match(card, /setLocale\(choice\.locale\)/);
  assert.doesNotMatch(card, /useSettingsDraft|setData|AppData/);
  assert.match(page, /<LanguageSettingsCard \/>/);
  assert.match(model, /id: "settings-language"/);
});

test("production smoke proves English LTR persistence then restores Persian before legacy journeys continue", () => {
  const smoke = read("scripts/production-browser-smoke.mjs");
  assert.match(smoke, /data-locale-choice="en"/);
  assert.match(smoke, /document\.documentElement\.lang === "en"/);
  assert.match(smoke, /document\.documentElement\.dir === "ltr"/);
  assert.match(smoke, /English locale persistence after reload/);
  assert.match(smoke, /data-locale-choice="fa-IR"/);
  assert.match(smoke, /Persian RTL locale restore/);
});

test("Phase 174 is isolated to the i18n foundation and defers full page translation", () => {
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_174_NOTES_FA.md");
  const pkg = read("package.json");
  assert.match(roadmap, /فاز ۱۷۴:[^\n]*i18n[^\n]*Foundation|فاز ۱۷۴:[^\n]*زیرساخت/);
  assert.match(roadmap, /فاز ۱۷۵:[^\n]*(Today|Month|Reports|صفحه)/);
  assert.match(notes, /Schema v17/);
  assert.match(notes, /Migration جدید: ندارد/);
  assert.match(notes, /Dependency جدید: ندارد/);
  assert.match(pkg, /phase174-i18n-core-foundation\.test\.ts/);
  assert.doesNotMatch(pkg, /phase175-i18n/);
});
