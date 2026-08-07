import type { Metadata } from "next";
import { ABOUT_METADATA, createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata(ABOUT_METADATA);

export default function RouteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
