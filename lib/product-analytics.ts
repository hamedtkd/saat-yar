import type { Mode, WorkTimingMode } from "./types.ts";

export const ANALYTICS_CONSENT_STORAGE_KEY = "saatyar-product-analytics-consent-v1";
export const ANALYTICS_CONSENT_CHANGE_EVENT = "saatyar:product-analytics-consent-change";
const ANALYTICS_SESSION_DISCOVERY_KEY = "saatyar-product-analytics-discovery-v1";
const MAX_BUFFERED_EVENTS = 24;

export type AnalyticsConsent = "unset" | "granted" | "denied";
export type AnalyticsRoute = "onboarding" | "today" | "month" | "leave" | "reports" | "clients" | "projects" | "invoices" | "import" | "settings" | "about" | "privacy" | "terms";
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
  | { provider: "ga4"; configured: true; label: "Google Analytics 4"; measurementId: string };

export type Ga4Event = {
  name: string;
  parameters: Record<string, string | number | boolean>;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __saatyarGa4Ready?: Promise<void>;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

let bufferedEvents: ProductAnalyticsEvent[] = [];

function safeWindow() {
  return typeof window === "undefined" ? null : window as unknown as AnalyticsWindow;
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

function updateLoadedGa4Consent(granted: boolean) {
  const browser = safeWindow();
  const config = getProductAnalyticsProviderConfig();
  if (!browser || config.provider !== "ga4") return;
  browser[`ga-disable-${config.measurementId}`] = !granted;
  if (browser.gtag) {
    browser.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
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
  updateLoadedGa4Consent(consent === "granted");
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
  updateLoadedGa4Consent(false);
  browser.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT));
}

export function resolveProductAnalyticsProviderConfig(env: {
  provider?: string;
  gaMeasurementId?: string;
}): ProductAnalyticsProviderConfig {
  const provider = env.provider?.trim().toLowerCase();
  const measurementId = env.gaMeasurementId?.trim().toUpperCase();
  if (provider !== "ga4" || !measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) {
    return { provider: "none", configured: false, label: "Not configured" };
  }
  return { provider: "ga4", configured: true, label: "Google Analytics 4", measurementId };
}

export function getProductAnalyticsProviderConfig(): ProductAnalyticsProviderConfig {
  return resolveProductAnalyticsProviderConfig({
    provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER,
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  });
}

export function getAnalyticsRoute(pathname: string): AnalyticsRoute | null {
  const normalized = `/${pathname.split("?")[0].split("#")[0].split("/").filter(Boolean).join("/")}`;
  const route = normalized === "/" ? "/today" : normalized;
  const allowed: Record<string, AnalyticsRoute> = {
    "/onboarding": "onboarding", "/today": "today", "/month": "month", "/leave": "leave", "/reports": "reports",
    "/clients": "clients", "/projects": "projects", "/invoices": "invoices", "/import": "import", "/settings": "settings",
    "/about": "about", "/privacy": "privacy", "/terms": "terms",
  };
  if (route.startsWith("/settings/")) return "settings";
  return allowed[route] ?? null;
}

export function getFeatureForRoute(route: AnalyticsRoute): AnalyticsFeature | null {
  if (["clients", "projects", "invoices"].includes(route)) return "business";
  if (["today", "month", "leave", "reports", "import", "settings"].includes(route)) return route as AnalyticsFeature;
  return null;
}

export function buildGa4Event(event: ProductAnalyticsEvent, origin = "https://saat-yar.vercel.app"): Ga4Event {
  if (event.name === "route_viewed") {
    return {
      name: "page_view",
      parameters: {
        page_location: `${origin.replace(/\/$/, "")}/${event.properties.route}`,
        page_title: event.properties.route,
        saatyar_route: event.properties.route,
      },
    };
  }
  return { name: event.name, parameters: { ...event.properties } };
}

function ensureGa4Loaded(config: Extract<ProductAnalyticsProviderConfig, { provider: "ga4" }>) {
  const browser = safeWindow();
  if (!browser || typeof document === "undefined") return Promise.resolve();
  if (browser.__saatyarGa4Ready) return browser.__saatyarGa4Ready;

  browser.dataLayer = browser.dataLayer || [];
  browser.gtag = browser.gtag || function gtag(...args: unknown[]) { browser.dataLayer?.push(args); };
  browser[`ga-disable-${config.measurementId}`] = false;
  browser.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  browser.gtag("js", new Date());
  browser.gtag("config", config.measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  browser.__saatyarGa4Ready = new Promise<void>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-saatyar-ga4="${config.measurementId}"]`);
    if (existing) { resolve(); return; }
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`;
    script.dataset.saatyarGa4 = config.measurementId;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
  return browser.__saatyarGa4Ready;
}

async function sendAnalyticsEvent(event: ProductAnalyticsEvent) {
  const config = getProductAnalyticsProviderConfig();
  const browser = safeWindow();
  if (!config.configured || !browser || getProductAnalyticsConsent() !== "granted") return;
  await ensureGa4Loaded(config);
  if (!browser.gtag || browser[`ga-disable-${config.measurementId}`]) return;
  const ga4 = buildGa4Event(event, browser.location.origin);
  browser.gtag("event", ga4.name, ga4.parameters);
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
