import type { MetadataRoute } from "next";
import { PWA_APP_NAME, PWA_SHORT_NAME, SITE_DESCRIPTION } from "@/lib/site-metadata";

export const dynamic = "force-static";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const withBase = (path: string) => `${basePath}${path}`;

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: withBase("/"),
    name: PWA_APP_NAME,
    short_name: PWA_SHORT_NAME,
    description: SITE_DESCRIPTION,
    lang: "fa",
    dir: "auto",
    start_url: withBase("/today/"),
    scope: withBase("/"),
    display: "standalone",
    orientation: "any",
    background_color: "#07171c",
    theme_color: "#8b5cf6",
    categories: ["productivity", "business", "utilities"],
    icons: [
      { src: withBase("/icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: withBase("/icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: withBase("/icons/maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "امروز", short_name: "امروز", url: withBase("/today/"), icons: [{ src: withBase("/icons/icon-192.png"), sizes: "192x192" }] },
      { name: "تقویم کاری", short_name: "تقویم", url: withBase("/month/"), icons: [{ src: withBase("/icons/icon-192.png"), sizes: "192x192" }] },
      { name: "گزارش‌ها", short_name: "گزارش", url: withBase("/reports/"), icons: [{ src: withBase("/icons/icon-192.png"), sizes: "192x192" }] },
    ],
  };
}
