"use client";

import { useMemo } from "react";
import { translateSystem, type SystemMessageKey, type SystemMessageParams } from "@/lib/i18n/system";
import { useLocaleUi } from "./use-locale-ui";

export function useSystemUi() {
  const ui = useLocaleUi();
  return useMemo(() => ({
    ...ui,
    s: (key: SystemMessageKey, params?: SystemMessageParams) => translateSystem(ui.locale, key, params),
  }), [ui]);
}
