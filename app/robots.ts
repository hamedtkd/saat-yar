import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml").toString(),
    host: absoluteUrl("/").origin,
  };
}
