"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";

const FALLBACK_ROUTE = "/today";
const ALLOWED_ROUTES = new Set(["/today", "/employee/today", "/freelancer/today", "/hybrid/today", "/month", "/leave", "/reports", "/clients", "/projects", "/invoices", "/settings"]);

export default function HomePage() {
  const { t } = useLocale();
  const router = useRouter();

  useEffect(() => {
    const saved = window.localStorage.getItem("saatyar:last-route") || FALLBACK_ROUTE;
    router.replace(ALLOWED_ROUTES.has(saved) ? saved : FALLBACK_ROUTE);
  }, [router]);

  return <main className="grid min-h-screen place-items-center bg-[var(--page)] text-sm font-bold text-[var(--text-muted)]">{t("app.openingLastPage")}</main>;
}
