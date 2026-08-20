import Script from "next/script";
import { buildCloudflareBeaconData, getCloudflareWebAnalyticsConfig } from "@/lib/cloudflare-web-analytics";

export function CloudflareWebAnalytics() {
  const config = getCloudflareWebAnalyticsConfig();
  if (!config.configured) return null;

  return (
    <Script
      id="saatyar-cloudflare-web-analytics"
      type="module"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={buildCloudflareBeaconData(config.token)}
    />
  );
}
