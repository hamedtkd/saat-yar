"use client";

type DraftEntry = {
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
    if (!entries.delete(id)) return;
    emit();
  };
}

export function subscribeSettingsDrafts(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSettingsDraftVersion() {
  return version;
}

export function hasUnsavedSettingsDrafts() {
  return [...entries.values()].some((entry) => entry.dirty);
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
