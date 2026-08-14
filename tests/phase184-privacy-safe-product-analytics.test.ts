import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  buildPlausiblePayload,
  getAnalyticsRoute,
  getFeatureForRoute,
  resolveProductAnalyticsProviderConfig,
} from "../lib/product-analytics.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("analytics consent stays browser-local and does not expand AppData or schema v19", () => {
  assert.equal(APP_DATA_SCHEMA_VERSION, 19);
  assert.equal(ANALYTICS_CONSENT_STORAGE_KEY, "saatyar-product-analytics-consent-v1");
  const types = read("lib/types.ts");
  assert.doesNotMatch(types, /analyticsConsent|productAnalyticsConsent/);
  const backup = read("lib/backup-schema.ts");
  assert.doesNotMatch(backup, /analyticsConsent|productAnalyticsConsent/);
});

test("provider selection is explicit and defaults to no analytics transport", () => {
  assert.deepEqual(resolveProductAnalyticsProviderConfig({}), { provider: "none", configured: false, label: "Not configured" });
  assert.deepEqual(resolveProductAnalyticsProviderConfig({ provider: "ga4", plausibleDomain: "example.com" }), { provider: "none", configured: false, label: "Not configured" });
  const plausible = resolveProductAnalyticsProviderConfig({ provider: "plausible", plausibleDomain: "example.com" });
  assert.equal(plausible.provider, "plausible");
  assert.equal(plausible.configured, true);
  if (plausible.provider === "plausible") assert.equal(plausible.endpoint, "https://plausible.io/api/event");
});

test("analytics payloads use an allowlisted taxonomy without personal work content", () => {
  const config = resolveProductAnalyticsProviderConfig({ provider: "plausible", plausibleDomain: "example.com" });
  assert.equal(config.provider, "plausible");
  if (config.provider !== "plausible") return;
  const payload = buildPlausiblePayload({ name: "work_started", properties: { mode: "employee", timing: "flexible" } }, config);
  assert.deepEqual(payload, {
    name: "work_started",
    url: "https://example.com/event",
    domain: "example.com",
    props: { mode: "employee", timing: "flexible" },
  });
  const serialized = JSON.stringify(payload).toLowerCase();
  for (const forbidden of ["salary", "income", "client", "projectid", "note", "message", "recordid", "userid"]) {
    assert.equal(serialized.includes(forbidden), false, `payload unexpectedly contains ${forbidden}`);
  }
});

test("route analytics strips query/hash detail and maps only known product surfaces", () => {
  assert.equal(getAnalyticsRoute("/reports/?project=secret#row-1"), "reports");
  assert.equal(getAnalyticsRoute("/clients/"), "clients");
  assert.equal(getAnalyticsRoute("/unknown/private-path"), null);
  assert.equal(getFeatureForRoute("reports"), "reports");
  assert.equal(getFeatureForRoute("projects"), "business");
  assert.equal(getFeatureForRoute("onboarding"), null);
});

test("onboarding Settings and runtime expose explicit opt-in opt-out and coarse error tracking", () => {
  const consent = read("components/analytics/analytics-consent-controls.tsx");
  const privacyStep = read("components/layout/onboarding/privacy-step.tsx");
  const settings = read("components/pages/settings/analytics-privacy-card.tsx");
  const nav = read("components/pages/settings/settings-navigation-model.ts");
  const runtime = read("components/analytics/product-analytics-runtime.tsx");
  const shell = read("components/saatyar-shell.tsx");
  assert.match(consent, /data-analytics-opt-in/);
  assert.match(consent, /data-analytics-opt-out/);
  assert.match(consent, /Analytics is not configured in this build/);
  assert.match(privacyStep, /AnalyticsConsentControls/);
  assert.match(settings, /data-product-analytics-settings/);
  assert.match(nav, /settings-analytics/);
  assert.match(runtime, /unhandled-rejection/);
  assert.match(runtime, /save-error/);
  assert.match(shell, /ProductAnalyticsRuntime/);
});

test("Phase 184 instruments funnel events documents the privacy boundary and stays dependency-free", () => {
  const onboarding = read("components/layout/onboarding.tsx");
  const attendance = read("hooks/controller/use-attendance-actions.ts");
  const notifications = read("components/pages/settings/notification-settings-card.tsx");
  const docs = read("docs/phases/PHASE_184_NOTES_FA.md");
  const privacyDoc = read("docs/product-analytics/PRIVACY_SAFE_ANALYTICS_FA.md");
  const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string>; dependencies: Record<string, string> };
  assert.match(onboarding, /onboarding_step_viewed/);
  assert.match(onboarding, /onboarding_completed/);
  assert.match(attendance, /work_started/);
  assert.match(attendance, /work_completed/);
  assert.match(attendance, /activity-segments/);
  assert.match(notifications, /notification-intelligence/);
  assert.match(docs, /Schema v19/);
  assert.match(privacyDoc, /Plausible/);
  assert.match(packageJson.scripts.test, /tests\/phase184-privacy-safe-product-analytics\.test\.ts/);
  assert.equal(Object.keys(packageJson.dependencies).some((name) => name.includes("analytics") || name.includes("plausible") || name.includes("gtag")), false);
});
