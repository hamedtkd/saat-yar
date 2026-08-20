export type CloudflareWebAnalyticsConfig =
  | { provider: "none"; configured: false; label: "Not configured" }
  | { provider: "cloudflare"; configured: true; label: "Cloudflare Web Analytics"; token: string };

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

export function resolveCloudflareWebAnalyticsConfig(token?: string): CloudflareWebAnalyticsConfig {
  const normalized = token?.trim();
  if (!normalized || !TOKEN_PATTERN.test(normalized)) {
    return { provider: "none", configured: false, label: "Not configured" };
  }
  return { provider: "cloudflare", configured: true, label: "Cloudflare Web Analytics", token: normalized };
}

export function getCloudflareWebAnalyticsConfig(): CloudflareWebAnalyticsConfig {
  return resolveCloudflareWebAnalyticsConfig(process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN);
}

export function buildCloudflareBeaconData(token: string) {
  return JSON.stringify({ token });
}
