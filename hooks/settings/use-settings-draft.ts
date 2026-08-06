"use client";

import { useMemo, useState } from "react";

export function useSettingsDraft<T>({
  value,
  autoSave,
  onSave,
}: {
  value: T;
  autoSave: boolean;
  onSave: (value: T) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localDraft, setLocalDraft] = useState<T>(value);
  const draft = editing ? localDraft : value;
  const dirty = useMemo(
    () => editing && JSON.stringify(localDraft) !== JSON.stringify(value),
    [editing, localDraft, value],
  );

  function beginEdit() {
    setLocalDraft(value);
    setEditing(true);
  }

  function update(next: T | ((previous: T) => T)) {
    const previous = editing ? localDraft : value;
    const resolved = typeof next === "function"
      ? (next as (current: T) => T)(previous)
      : next;
    if (autoSave) onSave(resolved);
    else setLocalDraft(resolved);
  }

  function save() {
    onSave(localDraft);
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

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
