import type { Metadata } from "next";
import { TERMS_METADATA, createPageMetadata } from "@/lib/site-metadata";
export const metadata: Metadata = createPageMetadata(TERMS_METADATA);
export default function RouteLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
