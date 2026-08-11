"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "./locale-provider";
import { getHtmlLang } from "@/lib/i18n";
import { translateSystem } from "@/lib/i18n/system";
import type { MessageKey } from "@/lib/i18n";

const routeTitleKeys: Record<string, MessageKey> = {
  "/today": "nav.today",
  "/month": "nav.month",
  "/clients": "nav.clients",
  "/projects": "nav.projects",
  "/invoices": "nav.invoices",
  "/leave": "nav.leave",
  "/reports": "nav.reports",
  "/settings": "nav.settings",
  "/about": "nav.about",
  "/onboarding": "settings.nav.onboarding",
};

function normalizePathname(pathname: string) {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

export function LocaleRuntime() {
  const pathname = normalizePathname(usePathname() || "/");
  const { locale, direction, calendar, t } = useLocale();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = getHtmlLang(locale);
    root.dir = direction;
    root.dataset.locale = locale;
    root.dataset.calendar = calendar;

    const routeKey = routeTitleKeys[pathname];
    const routeTitle = routeKey
      ? t(routeKey)
      : pathname === "/import"
        ? translateSystem(locale, "Import files")
        : pathname === "/"
          ? t("app.name")
          : null;
    if (!routeTitle) return;

    const expectedTitle = pathname === "/" ? routeTitle : `${routeTitle} | ${t("app.name")}`;
    const syncTitle = () => {
      if (document.title !== expectedTitle) document.title = expectedTitle;
    };

    // Next's static metadata remains canonical Persian and may update <title>
    // after hydration. Keep the runtime locale title authoritative without polling.
    syncTitle();
    const titleObserver = new MutationObserver(syncTitle);
    titleObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => titleObserver.disconnect();
  }, [calendar, direction, locale, pathname, t]);

  return null;
}
