import type { MetadataRoute } from "next";
import { ABOUT_METADATA, absoluteUrl, ROUTE_METADATA } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const updatedAt = new Date("2026-08-07T00:00:00.000Z");
  return [
    { url: absoluteUrl("/").toString(), lastModified: updatedAt, changeFrequency: "monthly", priority: 1 },
    ...[...Object.values(ROUTE_METADATA), ABOUT_METADATA].map((page) => ({
      url: absoluteUrl(page.path).toString(),
      lastModified: updatedAt,
      changeFrequency: "monthly" as const,
      priority: page.path === "/today/" ? 0.9 : page.path === "/about/" ? 0.5 : 0.7,
    })),
  ];
}
