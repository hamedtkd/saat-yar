import assert from "node:assert/strict";
import test from "node:test";
import { buildGa4Event, getAnalyticsRoute, resolveProductAnalyticsProviderConfig } from "../lib/product-analytics.ts";
import { getPrivacyCopy, getTermsCopy } from "../lib/legal-content.ts";
import { isPublicRoute, isSupplementalRoute } from "../lib/navigation.ts";

test("GA4 provider requires an explicit valid measurement id", () => {
  assert.deepEqual(resolveProductAnalyticsProviderConfig({ provider: "ga4", gaMeasurementId: "bad" }), { provider: "none", configured: false, label: "Not configured" });
  assert.deepEqual(resolveProductAnalyticsProviderConfig({ provider: "plausible", gaMeasurementId: "G-ABC123" }), { provider: "none", configured: false, label: "Not configured" });
  assert.deepEqual(resolveProductAnalyticsProviderConfig({ provider: "ga4", gaMeasurementId: "g-abc123" }), { provider: "ga4", configured: true, label: "Google Analytics 4", measurementId: "G-ABC123" });
});

test("GA4 page views are normalized and never include route query or hash detail", () => {
  assert.equal(getAnalyticsRoute("/privacy/?token=secret#detail"), "privacy");
  assert.deepEqual(buildGa4Event({ name: "route_viewed", properties: { route: "privacy" } }, "https://saat-yar.vercel.app/"), {
    name: "page_view",
    parameters: { page_location: "https://saat-yar.vercel.app/privacy", page_title: "privacy", saatyar_route: "privacy" },
  });
});

test("Google OAuth legal disclosure documents both requested calendar scopes", () => {
  const privacy = getPrivacyCopy("en");
  const text = JSON.stringify(privacy);
  assert.match(text, /calendar\.calendarlist\.readonly/);
  assert.match(text, /calendar\.events/);
  assert.match(text, /OAuth access token is kept in browser memory/);
  assert.match(text, /not sold/);
});

test("About privacy and terms are public supplemental routes before onboarding", () => {
  for (const path of ["/about", "/privacy/", "/terms"]) {
    assert.equal(isPublicRoute(path), true);
    assert.equal(isSupplementalRoute(path), true);
  }
  assert.equal(isPublicRoute("/settings"), false);
});

test("terms disclose optional external services without changing local-first ownership", () => {
  const fa = getTermsCopy("fa-IR");
  const en = getTermsCopy("en");
  assert.match(JSON.stringify(fa), /Google Calendar/);
  assert.match(JSON.stringify(en), /Google Analytics/);
  assert.match(JSON.stringify(en), /local-first/);
});
