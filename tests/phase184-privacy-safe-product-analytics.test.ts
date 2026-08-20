import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveCloudflareWebAnalyticsConfig } from "../lib/cloudflare-web-analytics.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("analytics stays outside AppData and the data schema", () => {
  assert.ok(APP_DATA_SCHEMA_VERSION >= 19);
  const types = read("lib/types.ts");
  assert.doesNotMatch(types, /analyticsConsent|productAnalyticsConsent|cloudflareAnalytics/);
  const backup = read("lib/backup-schema.ts");
  assert.doesNotMatch(backup, /analyticsConsent|productAnalyticsConsent|cloudflareAnalytics/);
});

test("current traffic analytics transport is explicitly configured and dependency-free", () => {
  assert.deepEqual(resolveCloudflareWebAnalyticsConfig(), { provider: "none", configured: false, label: "Not configured" });
  const configured = resolveCloudflareWebAnalyticsConfig("abcDEF0123456789abcDEF0123456789");
  assert.equal(configured.provider, "cloudflare");
  assert.equal(configured.configured, true);
  const packageJson = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
  assert.equal(Object.keys(packageJson.dependencies).some((name) => /analytics|plausible|gtag/i.test(name)), false);
});

test("onboarding and Settings disclose aggregate traffic analytics without consent controls", () => {
  const privacyStep = read("components/layout/onboarding/privacy-step.tsx");
  const settings = read("components/pages/settings/analytics-privacy-card.tsx");
  const nav = read("components/pages/settings/settings-navigation-model.ts");
  assert.match(privacyStep, /CloudflareAnalyticsInfo/);
  assert.match(settings, /data-cloudflare-web-analytics-settings/);
  assert.match(settings, /CloudflareAnalyticsInfo/);
  assert.match(nav, /settings-analytics/);
  assert.doesNotMatch(`${privacyStep}\n${settings}`, /data-analytics-opt-in|data-analytics-opt-out|AnalyticsConsentControls/);
});

test("current runtime no longer emits custom work or funnel analytics events", () => {
  const onboarding = read("components/layout/onboarding.tsx");
  const attendance = read("hooks/controller/use-attendance-actions.ts");
  const notifications = read("components/pages/settings/notification-settings-card.tsx");
  const shell = read("components/saatyar-shell.tsx");
  for (const source of [onboarding, attendance, notifications, shell]) {
    assert.doesNotMatch(source, /trackProductAnalytics|ProductAnalyticsRuntime|onboarding_step_viewed|work_started|feature_used/);
  }
});

test("historical Phase 184 privacy boundary remains documented after the transport migration", () => {
  const docs = read("docs/phases/PHASE_184_NOTES_FA.md");
  assert.match(docs, /Schema v19/);
  assert.match(docs, /Plausible|Analytics/);
});

test("current analytics documentation names Cloudflare and excludes work content", () => {
  const privacyDoc = read("docs/product-analytics/PRIVACY_SAFE_ANALYTICS_FA.md");
  assert.match(privacyDoc, /Cloudflare Web Analytics/);
  assert.match(privacyDoc, /cookie|کوکی/i);
  assert.match(privacyDoc, /AppData/);
  assert.doesNotMatch(privacyDoc, /NEXT_PUBLIC_GA_MEASUREMENT_ID|NEXT_PUBLIC_ANALYTICS_PROVIDER=ga4/);
});
