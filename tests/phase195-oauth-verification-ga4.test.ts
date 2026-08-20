import assert from "node:assert/strict";
import test from "node:test";
import { getPrivacyCopy, getTermsCopy } from "../lib/legal-content.ts";
import { resolveCloudflareWebAnalyticsConfig } from "../lib/cloudflare-web-analytics.ts";
import { getHelpCopy } from "../lib/help-content.ts";
import { isPublicRoute, isSupplementalRoute } from "../lib/navigation.ts";

test("current analytics provider requires an explicit valid Cloudflare site token", () => {
  assert.deepEqual(resolveCloudflareWebAnalyticsConfig("bad token"), { provider: "none", configured: false, label: "Not configured" });
  const config = resolveCloudflareWebAnalyticsConfig("0123456789abcdef0123456789abcdef");
  assert.equal(config.provider, "cloudflare");
  assert.equal(config.configured, true);
});

test("current privacy copy replaces GA4 runtime disclosure with Cloudflare traffic analytics", () => {
  const privacy = getPrivacyCopy("en");
  const text = JSON.stringify(privacy);
  assert.match(text, /Cloudflare Web Analytics/);
  assert.match(text, /aggregate page traffic/);
  assert.doesNotMatch(text, /Google Analytics 4|Google Consent Mode|GA4/);
});

test("Google OAuth legal disclosure still documents both requested calendar scopes", () => {
  const privacy = getPrivacyCopy("en");
  const text = JSON.stringify(privacy);
  assert.match(text, /calendar\.calendarlist\.readonly/);
  assert.match(text, /calendar\.events/);
  assert.match(text, /OAuth access token is kept in browser memory/);
  assert.match(text, /not sold/);
});

test("About help privacy and terms remain public supplemental routes before onboarding", () => {
  for (const path of ["/about", "/help", "/privacy/", "/terms"]) {
    assert.equal(isPublicRoute(path), true);
    assert.equal(isSupplementalRoute(path), true);
  }
  assert.equal(isPublicRoute("/settings"), false);
  for (const locale of ["fa-IR", "en"] as const) {
    const help = getHelpCopy(locale);
    assert.ok(help.sections.length >= 6);
    const text = JSON.stringify(help);
    assert.match(text, /Google Calendar/);
    assert.match(text, /WebRTC/);
    assert.match(text, /Cloudflare Web Analytics/);
    assert.doesNotMatch(text, /GA4/);
  }
});

test("terms disclose Cloudflare traffic analytics without changing local-first ownership", () => {
  const fa = getTermsCopy("fa-IR");
  const en = getTermsCopy("en");
  assert.match(JSON.stringify(fa), /Cloudflare Web Analytics/);
  assert.match(JSON.stringify(en), /Cloudflare Web Analytics/);
  assert.match(JSON.stringify(en), /local-first/);
});
