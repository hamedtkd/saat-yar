import type { Metadata } from "next";
import { HELP_METADATA, createPageMetadata } from "@/lib/site-metadata";
export const metadata: Metadata = createPageMetadata(HELP_METADATA);
export default function RouteLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
