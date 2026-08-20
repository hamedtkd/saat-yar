# Saatyar 2.6.1 — Privacy-safe Analytics Hotfix

Saatyar 2.6.1 is a focused analytics/privacy patch. It does not change AppData or the core work-tracking workflows.

## Main change

Google Analytics 4 has been removed from the current Saatyar runtime and replaced with Cloudflare Web Analytics.

Saatyar currently needs analytics only to understand aggregate visits, visitors, referrers, and page performance. The app therefore no longer maintains a custom product-event taxonomy, analytics consent state, or GA4 delivery runtime.

## Privacy boundary

- No GA4 / gtag.js in the current runtime
- No custom timer, onboarding, or feature-usage analytics events
- No WorkRecord, ActivitySegment, client/project names, notes, money amounts, work dates/times, record IDs, device-transfer payloads, or AppData are sent to analytics
- No schema migration; AppData remains v21
- No new dependency
- The Cloudflare beacon loads only when a valid site token is configured at build time

## Deployment configuration

Set this Production environment variable in Vercel using the Site Token from Cloudflare Web Analytics:

```text
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN
```

The token is not committed to the repository.
