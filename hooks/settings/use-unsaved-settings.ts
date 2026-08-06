"use client";

import { useSyncExternalStore } from "react";
import {
  discardAllSettingsDrafts,
  getSettingsDraftVersion,
  hasUnsavedSettingsDrafts,
  saveAllSettingsDrafts,
  subscribeSettingsDrafts,
} from "@/lib/settings-draft-registry";

export function useUnsavedSettings() {
  useSyncExternalStore(subscribeSettingsDrafts, getSettingsDraftVersion, getSettingsDraftVersion);

  return {
    hasUnsavedChanges: hasUnsavedSettingsDrafts(),
    saveAll: saveAllSettingsDrafts,
    discardAll: discardAllSettingsDrafts,
  };
}
