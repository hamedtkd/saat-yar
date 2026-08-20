import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCloudflareBeaconData,
  resolveCloudflareWebAnalyticsConfig,
} from "../lib/cloudflare-web-analytics.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { getHelpCopy } from "../lib/help-content.ts";
import { getPrivacyCopy, getTermsCopy } from "../lib/legal-content.ts";
import { assertProductionAnalyticsContract } from "../scripts/remote-production-audit.mjs";

test("Phase 203 keeps AppData on v21", () => {
  assert.equal(APP_DATA_SCHEMA_VERSION, 21);
});

test("Cloudflare analytics remains disabled when the site token is absent or malformed", () => {
  assert.deepEqual(resolveCloudflareWebAnalyticsConfig(), { provider: "none", configured: false, label: "Not configured" });
  assert.deepEqual(resolveCloudflareWebAnalyticsConfig("bad token"), { provider: "none", configured: false, label: "Not configured" });
});

test("Cloudflare analytics accepts a bounded public site token", () => {
  assert.deepEqual(resolveCloudflareWebAnalyticsConfig("0123456789abcdef0123456789abcdef"), {
    provider: "cloudflare",
    configured: true,
    label: "Cloudflare Web Analytics",
    token: "0123456789abcdef0123456789abcdef",
  });
});

test("Cloudflare beacon data and production contract exclude Google Analytics", () => {
  assert.equal(buildCloudflareBeaconData("0123456789abcdef0123456789abcdef"), '{"token":"0123456789abcdef0123456789abcdef"}');
  assert.doesNotThrow(() => assertProductionAnalyticsContract('<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{}"></script>'));
  assert.throws(() => assertProductionAnalyticsContract('<script src="https://www.googletagmanager.com/gtag/js"></script>'));
});

test("current privacy and help copy disclose Cloudflare without GA4 consent language", () => {
  const text = JSON.stringify({ privacy: getPrivacyCopy("en"), help: getHelpCopy("en") });
  assert.match(text, /Cloudflare Web Analytics/);
  assert.match(text, /aggregate/);
  assert.doesNotMatch(text, /Google Analytics 4|Google Consent Mode|GA4|opt-in|opt-out/);
});

test("terms keep external analytics separate from local-first work data", () => {
  const terms = JSON.stringify(getTermsCopy("en"));
  assert.match(terms, /Cloudflare Web Analytics/);
  assert.match(terms, /local-first/);
  assert.match(terms, /not custom work events/);
});
