"use client";

import { useMemo } from "react";
import { translateBusiness, type BusinessMessageKey, type BusinessMessageParams } from "@/lib/i18n/business";
import { useLocaleUi } from "./use-locale-ui";

export function useBusinessUi() {
  const ui = useLocaleUi();
  return useMemo(() => ({
    ...ui,
    b: (key: BusinessMessageKey, params?: BusinessMessageParams) => translateBusiness(ui.locale, key, params),
  }), [ui]);
}
