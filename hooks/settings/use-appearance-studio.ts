"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { applyAppearanceToDocument } from "@/components/theme/theme-runtime";
import {
  cloneAppearanceSettings,
  normalizeAppearanceSettings,
  validateAppearanceSettings,
} from "@/lib/appearance-settings";
import { registerSettingsDraft } from "@/lib/settings-draft-registry";
import type { Locale } from "@/lib/i18n/locales";
import type { AppearanceSettings } from "@/lib/types";

export function useAppearanceStudio({
  value,
  locale,
  label,
  onApply,
}: {
  value: AppearanceSettings;
  locale: Locale;
  label: string;
  onApply: (value: AppearanceSettings) => void;
}) {
  const registryId = useId();
  const committedRef = useRef(value);
  const [draftOverride, setDraftOverride] = useState<AppearanceSettings | null>(null);
  const draft = draftOverride ?? value;
  const dirty = useMemo(
    () => draftOverride !== null && JSON.stringify(draftOverride) !== JSON.stringify(value),
    [draftOverride, value],
  );
  const validationError = validateAppearanceSettings(draft, locale);

  useEffect(() => {
    committedRef.current = value;
  }, [value]);

  const replaceDraft = useCallback((next: AppearanceSettings) => {
    setDraftOverride(next);
    if (!validateAppearanceSettings(next, locale)) applyAppearanceToDocument(next);
  }, [locale]);

  const update = useCallback((patch: Partial<AppearanceSettings>) => {
    setDraftOverride((previous) => {
      const next = { ...(previous ?? value), ...patch };
      if (!validateAppearanceSettings(next, locale)) applyAppearanceToDocument(next);
      return next;
    });
  }, [locale, value]);

  const apply = useCallback(() => {
    if (validationError) return;
    const next = normalizeAppearanceSettings(draft);
    committedRef.current = next;
    setDraftOverride(null);
    applyAppearanceToDocument(next);
    onApply(next);
  }, [draft, onApply, validationError]);

  const discard = useCallback(() => {
    const committed = cloneAppearanceSettings(committedRef.current);
    setDraftOverride(null);
    applyAppearanceToDocument(committed);
  }, []);

  useEffect(
    () => registerSettingsDraft(registryId, { label, dirty, save: apply, discard }),
    [apply, dirty, discard, label, registryId],
  );

  useEffect(() => () => {
    applyAppearanceToDocument(committedRef.current);
  }, []);

  return { registryId, draft, dirty, validationError, update, replaceDraft, apply, discard };
}
