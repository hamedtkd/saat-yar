"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { registerSettingsDraft } from "@/lib/settings-draft-registry";

export function useSettingsDraft<T>({
  value,
  autoSave,
  onSave,
  label = "تنظیمات",
  prepare,
}: {
  value: T;
  autoSave: boolean;
  onSave: (value: T) => void;
  label?: string;
  prepare?: (value: T) => T;
}) {
  const registryId = useId();
  const [editing, setEditing] = useState(false);
  const [localDraft, setLocalDraft] = useState<T>(value);
  const draft = editing ? localDraft : value;
  const dirty = useMemo(
    () => editing && JSON.stringify(localDraft) !== JSON.stringify(value),
    [editing, localDraft, value],
  );

  const beginEdit = useCallback(() => {
    setLocalDraft(value);
    setEditing(true);
  }, [value]);

  const update = useCallback((next: T | ((previous: T) => T)) => {
    const previous = editing ? localDraft : value;
    const resolved = typeof next === "function"
      ? (next as (current: T) => T)(previous)
      : next;
    if (autoSave) onSave(resolved);
    else setLocalDraft(resolved);
  }, [autoSave, editing, localDraft, onSave, value]);

  const save = useCallback(() => {
    const prepared = prepare ? prepare(localDraft) : localDraft;
    onSave(prepared);
    setLocalDraft(prepared);
    setEditing(false);
  }, [localDraft, onSave, prepare]);

  const cancel = useCallback(() => {
    setEditing(false);
  }, []);

  useEffect(
    () => registerSettingsDraft(registryId, { label, dirty: autoSave ? false : dirty, save, discard: cancel }),
    [autoSave, cancel, dirty, label, registryId, save],
  );

  return {
    editing: autoSave || editing,
    manualEditing: editing,
    draft: autoSave ? value : draft,
    dirty: autoSave ? false : dirty,
    beginEdit,
    update,
    save,
    cancel,
  };
}
