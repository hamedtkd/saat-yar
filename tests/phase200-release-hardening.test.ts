import assert from "node:assert/strict";
import test from "node:test";
import { themeBrandSvg } from "../lib/brand-theme.ts";
import { translate } from "../lib/i18n/catalog.ts";
import { formatLocaleDate } from "../lib/i18n/formatters.ts";
import { translateSystem } from "../lib/i18n/system.ts";
import { PWA_APP_NAME, PWA_SHORT_NAME, ROUTE_METADATA } from "../lib/site-metadata.ts";

test("Phase 200 PWA identity keeps English and Persian discoverable while retaining a compact label", () => {
  assert.equal(PWA_APP_NAME, "Saatyar | ساعت یار");
  assert.equal(PWA_SHORT_NAME, "Saatyar");
  assert.match(PWA_APP_NAME, /Saatyar/);
  assert.match(PWA_APP_NAME, /ساعت یار/);
});

test("Phase 200 long dates follow Persian reading order and English reading order independently", () => {
  const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" } as const;
  assert.equal(
    formatLocaleDate("fa-IR", "2026-08-19", options, "persian"),
    "چهارشنبه، ۲۸ مرداد ۱۴۰۵",
  );
  assert.equal(
    formatLocaleDate("en", "2026-08-19", options, "gregory"),
    "Wednesday, August 19, 2026",
  );
  assert.equal(
    formatLocaleDate("en", "2026-08-19", options, "persian"),
    "Wednesday, Mordad 28, 1405 AP",
  );
  assert.equal(
    formatLocaleDate("fa-IR", "2026-08-19", options, "gregory"),
    "چهارشنبه، ۱۹ اوت ۲۰۲۶",
  );
});

test("Phase 200 weekday dates without a year keep the same locale-specific order", () => {
  const options = { weekday: "long", day: "numeric", month: "short" } as const;
  assert.equal(formatLocaleDate("fa-IR", "2026-08-19", options, "persian"), "چهارشنبه، ۲۸ مرداد");
  assert.equal(formatLocaleDate("en", "2026-08-19", options, "gregory"), "Wednesday, Aug 19");
});

test("Phase 200 themed brand SVG follows the active accent without changing the install identity", () => {
  const source = '<svg viewBox="0 0 2048 2048" width="1024" height="1024" preserveAspectRatio="none"><path fill="rgb(38,38,38)"/><path fill="rgb(11,12,12)"/></svg>';
  const themed = themeBrandSvg(source, "#8b5cf6", "#b9a0fa");
  assert.match(themed, /fill="#8b5cf6"/);
  assert.match(themed, /fill="#b9a0fa"/);
  assert.match(themed, /viewBox="560 480 960 960"/);
  assert.match(themed, /preserveAspectRatio="xMidYMid meet"/);
  assert.doesNotMatch(themed, /rgb\(38,38,38\)|rgb\(11,12,12\)/);
});


test("Phase 200 Work Calendar replaces the old My month label in both locales", () => {
  assert.equal(translate("fa-IR", "nav.month"), "تقویم کاری");
  assert.equal(translate("en", "nav.month"), "Work Calendar");
  assert.equal(translate("fa-IR", "month.title"), "تقویم کاری");
  assert.equal(translate("en", "month.title"), "Work Calendar");
  assert.equal(ROUTE_METADATA.month.title, "تقویم کاری");
  assert.equal(translateSystem("fa-IR", "My month"), "تقویم کاری");
  assert.equal(translateSystem("fa-IR", "Work Calendar"), "تقویم کاری");
});
