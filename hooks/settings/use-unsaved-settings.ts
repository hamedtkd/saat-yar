"use client";

import { useSyncExternalStore } from "react";
import {
  discardAllSettingsDrafts,
  getSettingsDraftVersion,
  getUnsavedSettingsDraftLabels,
  hasUnsavedSettingsDrafts,
  saveAllSettingsDrafts,
  subscribeSettingsDrafts,
} from "@/lib/settings-draft-registry";

export function useUnsavedSettings() {
  useSyncExternalStore(subscribeSettingsDrafts, getSettingsDraftVersion, getSettingsDraftVersion);

  return {
    hasUnsavedChanges: hasUnsavedSettingsDrafts(),
    dirtyLabels: getUnsavedSettingsDraftLabels(),
    saveAll: saveAllSettingsDrafts,
    discardAll: discardAllSettingsDrafts,
  };
}
