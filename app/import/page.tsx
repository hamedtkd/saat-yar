"use client";

import { ImportPage } from "@/components/pages/import/import-page";
import { useSaatyarContext } from "@/components/saatyar-shell";

export default function ImportRoute() {
  const controller = useSaatyarContext();
  if (!controller.ready) return null;
  return <ImportPage data={controller.data} commitImport={controller.commitImport} />;
}
