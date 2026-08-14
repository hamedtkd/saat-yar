import type { Mode, WorkTimingMode } from "./types.ts";

export const ANALYTICS_CONSENT_STORAGE_KEY = "saatyar-product-analytics-consent-v1";
export const ANALYTICS_CONSENT_CHANGE_EVENT = "saatyar:product-analytics-consent-change";
const ANALYTICS_SESSION_DISCOVERY_KEY = "saatyar-product-analytics-discovery-v1";
const MAX_BUFFERED_EVENTS = 24;

export type AnalyticsConsent = "unset" | "granted" | "denied";
export type AnalyticsRoute = "onboarding" | "today" | "month" | "leave" | "reports" | "clients" | "projects" | "invoices" | "import" | "settings" | "about";
export type AnalyticsFeature = "today" | "month" | "leave" | "reports" | "business" | "import" | "settings" | "activity-segments" | "notification-intelligence";
export type AnalyticsErrorArea = "runtime" | "navigation" | "persistence";
export type AnalyticsErrorCode = "window-error" | "unhandled-rejection" | "route-error" | "save-error";
export type OnboardingCompletionPath = "advanced" | "fast-setup" | "skip";

export type ProductAnalyticsEvent =
  | { name: "route_viewed"; properties: { route: AnalyticsRoute } }
  | { name: "feature_discovered"; properties: { feature: AnalyticsFeature } }
  | { name: "onboarding_step_viewed"; properties: { step: number; mode: Mode } }
  | { name: "onboarding_completed"; properties: { path: OnboardingCompletionPath; mode: Mode; timing: WorkTimingMode } }
  | { name: "work_started"; properties: { mode: Mode; timing: WorkTimingMode } }
  | { name: "work_completed"; properties: { mode: Mode; timing: WorkTimingMode } }
  | { name: "feature_used"; properties: { feature: "activity-segments" | "notification-intelligence" } }
  | { name: "ux_error"; properties: { area: AnalyticsErrorArea; code: AnalyticsErrorCode } };

export type ProductAnalyticsProviderConfig =
  | { provider: "none"; configured: false; label: "Not configured" }
  | { provider: "plausible"; configured: true; label: "Plausible"; domain: string; endpoint: string };

type PlausiblePayload = {
  name: string;
  url: string;
  domain: string;
  props: Record<string, string | number>;
};

let bufferedEvents: ProductAnalyticsEvent[] = [];

function safeWindow() {
  return typeof window === "undefined" ? null : window;
}

export function getProductAnalyticsConsent(): AnalyticsConsent {
  const browser = safeWindow();
  if (!browser) return "unset";
  try {
    const value = browser.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch {
    return "unset";
  }
}

export function setProductAnalyticsConsent(consent: Exclude<AnalyticsConsent, "unset">) {
  const browser = safeWindow();
  if (!browser) return;
  try {
    browser.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    // Analytics consent must never block the app when browser storage is unavailable.
  }
  browser.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT));
  if (consent === "denied") {
    bufferedEvents = [];
    try { browser.sessionStorage.removeItem(ANALYTICS_SESSION_DISCOVERY_KEY); } catch { /* optional dedupe state */ }
  } else void flushBufferedAnalyticsEvents();
}

export function clearProductAnalyticsConsent() {
  const browser = safeWindow();
  if (!browser) return;
  try {
    browser.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
  } catch {
    // Keep the app usable when storage is unavailable.
  }
  bufferedEvents = [];
  browser.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT));
}

export function resolveProductAnalyticsProviderConfig(env: {
  provider?: string;
  plausibleDomain?: string;
  plausibleEndpoint?: string;
}): ProductAnalyticsProviderConfig {
  const provider = env.provider?.trim().toLowerCase();
  const domain = env.plausibleDomain?.trim();
  if (provider !== "plausible" || !domain) return { provider: "none", configured: false, label: "Not configured" };
  return {
    provider: "plausible",
    configured: true,
    label: "Plausible",
    domain,
    endpoint: env.plausibleEndpoint?.trim() || "https://plausible.io/api/event",
  };
}

export function getProductAnalyticsProviderConfig(): ProductAnalyticsProviderConfig {
  return resolveProductAnalyticsProviderConfig({
    provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER,
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    plausibleEndpoint: process.env.NEXT_PUBLIC_PLAUSIBLE_ENDPOINT,
  });
}

export function getAnalyticsRoute(pathname: string): AnalyticsRoute | null {
  const normalized = `/${pathname.split("?")[0].split("#")[0].split("/").filter(Boolean).join("/")}`;
  const route = normalized === "/" ? "/today" : normalized;
  const allowed: Record<string, AnalyticsRoute> = {
    "/onboarding": "onboarding", "/today": "today", "/month": "month", "/leave": "leave", "/reports": "reports",
    "/clients": "clients", "/projects": "projects", "/invoices": "invoices", "/import": "import", "/settings": "settings", "/about": "about",
  };
  return allowed[route] ?? null;
}

export function getFeatureForRoute(route: AnalyticsRoute): AnalyticsFeature | null {
  if (["clients", "projects", "invoices"].includes(route)) return "business";
  if (["today", "month", "leave", "reports", "import", "settings"].includes(route)) return route as AnalyticsFeature;
  return null;
}

export function buildPlausiblePayload(event: ProductAnalyticsEvent, config: Extract<ProductAnalyticsProviderConfig, { provider: "plausible" }>): PlausiblePayload {
  const route = event.name === "route_viewed" ? event.properties.route : "event";
  return {
    name: event.name === "route_viewed" ? "pageview" : event.name,
    url: `https://${config.domain}/${route}`,
    domain: config.domain,
    props: { ...event.properties },
  };
}

async function sendAnalyticsEvent(event: ProductAnalyticsEvent) {
  const config = getProductAnalyticsProviderConfig();
  if (!config.configured) return;
  const payload = buildPlausiblePayload(event, config);
  try {
    await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "omit",
    });
  } catch {
    // Analytics is best effort and must never affect product flows.
  }
}

export function trackProductAnalytics(event: ProductAnalyticsEvent) {
  const consent = getProductAnalyticsConsent();
  if (consent === "denied") return;
  if (consent === "unset") {
    bufferedEvents = [...bufferedEvents.slice(-(MAX_BUFFERED_EVENTS - 1)), event];
    return;
  }
  void sendAnalyticsEvent(event);
}

export async function flushBufferedAnalyticsEvents() {
  if (getProductAnalyticsConsent() !== "granted" || bufferedEvents.length === 0) return;
  const pending = bufferedEvents;
  bufferedEvents = [];
  for (const event of pending) await sendAnalyticsEvent(event);
}

export function markFeatureDiscovered(feature: AnalyticsFeature) {
  const browser = safeWindow();
  if (!browser) return;
  try {
    const seen = new Set((browser.sessionStorage.getItem(ANALYTICS_SESSION_DISCOVERY_KEY) || "").split(",").filter(Boolean));
    if (seen.has(feature)) return;
    seen.add(feature);
    browser.sessionStorage.setItem(ANALYTICS_SESSION_DISCOVERY_KEY, [...seen].join(","));
  } catch {
    // Discovery dedupe is optional; still emit the safe aggregate event.
  }
  trackProductAnalytics({ name: "feature_discovered", properties: { feature } });
}
