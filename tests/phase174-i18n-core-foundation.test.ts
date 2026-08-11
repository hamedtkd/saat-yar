import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  CALENDAR_STORAGE_KEY,
  DEFAULT_CALENDAR_PREFERENCE,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getHtmlLang,
  getLocaleDirection,
  normalizeCalendarPreference,
  readStoredCalendarPreference,
  resolveCalendarSystem,
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
  assert.equal(DEFAULT_CALENDAR_PREFERENCE, "auto");
  assert.equal(normalizeCalendarPreference("gregory"), "gregory");
  assert.equal(normalizeCalendarPreference("persian"), "persian");
  assert.equal(normalizeCalendarPreference("unknown"), "auto");
  assert.equal(resolveCalendarSystem("en", "auto"), "gregory");
  assert.equal(resolveCalendarSystem("fa-IR", "auto"), "persian");
  assert.equal(resolveCalendarSystem("en", "persian"), "persian");
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

  assert.equal(CALENDAR_STORAGE_KEY, "saatyar-calendar-v1");
  const calendarStorage = { getItem: (key: string) => key === CALENDAR_STORAGE_KEY ? "gregory" : null };
  assert.equal(readStoredCalendarPreference(calendarStorage), "gregory");
  const calendarStore = read("lib/i18n/calendar-store.ts");
  assert.match(calendarStore, /localStorage\.setItem\(CALENDAR_STORAGE_KEY, preference\)/);
  assert.doesNotMatch(calendarStore, /AppData|setData|schemaVersion/);
});

test("locale provider uses one external store without polling or persistence side effects", () => {
  const provider = read("components/i18n/locale-provider.tsx");
  assert.match(provider, /useSyncExternalStore\(subscribeBrowserLocale, getBrowserLocale/);
  assert.match(provider, /subscribeBrowserCalendarPreference/);
  assert.match(provider, /resolveCalendarSystem\(locale, calendarPreference\)/);
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
  assert.match(runtime, /root\.dataset\.calendar = calendar/);
  assert.match(bootstrap, /CALENDAR_STORAGE_KEY/);
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
  const quick = read("components/layout/language-switcher.tsx");
  const actions = read("components/layout/app-header/header-actions.tsx");
  const sidebar = read("components/layout/navigation/sidebar-nav.tsx");
  assert.match(card, /data-locale-choice=\{choice\.locale\}/);
  assert.match(card, /setLocale\(choice\.locale\)/);
  assert.match(card, /data-calendar-choice=\{choice\.preference\}/);
  assert.match(card, /setCalendarPreference\(choice\.preference\)/);
  assert.doesNotMatch(card, /useSettingsDraft|setData|AppData/);
  assert.match(page, /<LanguageSettingsCard \/>/);
  assert.match(model, /id: "settings-language"/);
  assert.match(quick, /setLocale\(value as Locale\)/);
  assert.match(quick, /data-quick-locale-choice=\{choice\.locale\}/);
  assert.match(quick, /header\.languageCurrent/);
  assert.doesNotMatch(quick, /useSettingsDraft|setData|AppData/);
  assert.match(actions, /<LanguageSwitcher variant="compact" className="xl:hidden" \/>/);
  assert.match(sidebar, /<LanguageSwitcher variant="sidebar" \/>/);
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

test("Phase 174 remains an isolated i18n foundation with a documented Phase 175 handoff", () => {
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_174_NOTES_FA.md");
  const pkg = read("package.json");
  assert.match(roadmap, /فاز ۱۷۴:[^\n]*i18n[^\n]*Foundation|فاز ۱۷۴:[^\n]*زیرساخت/);
  assert.match(roadmap, /فاز ۱۷۵:[^\n]*(Today|Month|Reports|صفحه)/);
  assert.match(notes, /Schema v17/);
  assert.match(notes, /Migration جدید: ندارد/);
  assert.match(notes, /Dependency جدید: ندارد/);
  assert.match(pkg, /phase174-i18n-core-foundation\.test\.ts/);
  assert.match(pkg, /phase175-i18n-core-pages\.test\.ts/);
});
