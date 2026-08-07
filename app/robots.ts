import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml").toString(),
    host: absoluteUrl("/").origin,
  };
}
