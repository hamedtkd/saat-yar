import type { Metadata } from "next";
import { createPageMetadata, ROUTE_METADATA } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata(ROUTE_METADATA.clients);

export default function RouteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
