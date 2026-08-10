"use client";

import { useEffect } from "react";
import { useLocale } from "./locale-provider";
import { getHtmlLang } from "@/lib/i18n";

export function LocaleRuntime() {
  const { locale, direction } = useLocale();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = getHtmlLang(locale);
    root.dir = direction;
    root.dataset.locale = locale;
  }, [direction, locale]);

  return null;
}
