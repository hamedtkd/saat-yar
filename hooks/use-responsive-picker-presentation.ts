"use client";

import { useSyncExternalStore } from "react";

import {
  PICKER_MOBILE_QUERY,
  type PickerPresentation,
  type PickerPresentationPreference,
} from "@/lib/pickers/responsive-presentation";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(PICKER_MOBILE_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(PICKER_MOBILE_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useResponsivePickerPresentation(
  preference: PickerPresentationPreference = "auto",
): PickerPresentation {
  const mobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (preference !== "auto") return preference;
  return mobile ? "drawer" : "popover";
}
