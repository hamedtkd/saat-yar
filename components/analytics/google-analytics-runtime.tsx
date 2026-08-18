"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useProductAnalyticsConsent } from "@/hooks/use-product-analytics-consent";
import {
  flushBufferedAnalyticsEvents,
  getGa4ConsentDefaults,
  getProductAnalyticsProviderConfig,
} from "@/lib/product-analytics";

export function GoogleAnalyticsRuntime() {
  const { consent } = useProductAnalyticsConsent();
  const config = getProductAnalyticsProviderConfig();
  const enabled = config.provider === "ga4" && consent !== "denied";

  useEffect(() => {
    if (enabled && typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) void flushBufferedAnalyticsEvents();
  }, [enabled]);

  if (!enabled || config.provider !== "ga4") return null;

  const [globalDefault, regionalDefault] = getGa4ConsentDefaults();
  const gaId = config.measurementId;
  const init = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', ${JSON.stringify(globalDefault)});
gtag('consent', 'default', ${JSON.stringify(regionalDefault)});
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)}, {
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});`;

  return (
    <>
      <Script id="saatyar-ga-init" strategy="afterInteractive">{init}</Script>
      <Script
        id="saatyar-ga"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
        onReady={() => void flushBufferedAnalyticsEvents()}
      />
    </>
  );
}
