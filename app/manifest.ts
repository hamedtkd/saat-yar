import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata";

export const dynamic = "force-static";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const withBase = (path: string) => `${basePath}${path}`;

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: withBase("/"),
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: "fa",
    dir: "rtl",
    start_url: withBase("/today/"),
    scope: withBase("/"),
    display: "standalone",
    orientation: "any",
    background_color: "#07171c",
    theme_color: "#06b6d4",
    categories: ["productivity", "business", "utilities"],
    icons: [
      { src: withBase("/icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: withBase("/icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: withBase("/icons/maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "امروز", short_name: "امروز", url: withBase("/today/"), icons: [{ src: withBase("/icons/icon-192.png"), sizes: "192x192" }] },
      { name: "ماه من", short_name: "ماه", url: withBase("/month/"), icons: [{ src: withBase("/icons/icon-192.png"), sizes: "192x192" }] },
      { name: "گزارش‌ها", short_name: "گزارش", url: withBase("/reports/"), icons: [{ src: withBase("/icons/icon-192.png"), sizes: "192x192" }] },
    ],
  };
}
