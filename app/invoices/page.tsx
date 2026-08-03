"use client";
import { InvoicesPage } from "@/components/pages/invoices/invoices-page";
import { useSaatyarContext } from "@/components/saatyar-shell";
export default function InvoicesRoute() {
  const controller = useSaatyarContext();
  if (!controller.ready) return null;
  return <InvoicesPage data={controller.data} setData={controller.setData} financialsHidden={controller.financialsHidden} />;
}
