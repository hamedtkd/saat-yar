"use client";

type DraftEntry = {
  label: string;
  dirty: boolean;
  save: () => void;
  discard: () => void;
};

const entries = new Map<string, DraftEntry>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function registerSettingsDraft(id: string, entry: DraftEntry) {
  const previous = entries.get(id);
  entries.set(id, entry);
  if (previous?.dirty !== entry.dirty) emit();

  return () => {
    const current = entries.get(id);
    if (!entries.delete(id)) return;
    if (current?.dirty) emit();
  };
}

export function subscribeSettingsDrafts(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSettingsDraftVersion() {
  return version;
}

export function getUnsavedSettingsDraftLabels() {
  return [...entries.values()]
    .filter((entry) => entry.dirty)
    .map((entry) => entry.label);
}

export function getUnsavedSettingsDraftLabelsExcept(id: string) {
  return [...entries.entries()]
    .filter(([entryId, entry]) => entryId !== id && entry.dirty)
    .map(([, entry]) => entry.label);
}

export function hasUnsavedSettingsDrafts() {
  return [...entries.values()].some((entry) => entry.dirty);
}

export function hasUnsavedSettingsDraftsExcept(id: string) {
  return [...entries.entries()]
    .some(([entryId, entry]) => entryId !== id && entry.dirty);
}

export function saveAllSettingsDrafts() {
  entries.forEach((entry) => {
    if (entry.dirty) entry.save();
  });
}

export function discardAllSettingsDrafts() {
  entries.forEach((entry) => {
    if (entry.dirty) entry.discard();
  });
}
