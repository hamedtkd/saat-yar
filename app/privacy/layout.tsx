import type { Metadata } from "next";
import { PRIVACY_METADATA, createPageMetadata } from "@/lib/site-metadata";
export const metadata: Metadata = createPageMetadata(PRIVACY_METADATA);
export default function RouteLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
