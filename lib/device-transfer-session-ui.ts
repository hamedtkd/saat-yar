import { translateSystem } from "./i18n/system.ts";
import type { Locale } from "./i18n/locales.ts";
export type DeviceTransferSessionRole = "idle" | "sender" | "receiver";
export type DeviceTransferSessionState = "idle" | "preparing" | "waiting" | "connected" | "received" | "completed" | "error";

export type DeviceTransferSessionView = {
  currentStep: number;
  completed: boolean;
  label: string;
};

export function getDeviceTransferSessionView(
  role: DeviceTransferSessionRole,
  state: DeviceTransferSessionState,
  locale: Locale = "fa-IR",
): DeviceTransferSessionView {
  if (state === "completed") {
    return { currentStep: 4, completed: true, label: translateSystem(locale, "This transfer session is complete") };
  }
  if (state === "error") {
    return { currentStep: role === "idle" ? 0 : 1, completed: false, label: translateSystem(locale, "Connection needs review") };
  }
  if (role === "idle") {
    return { currentStep: 0, completed: false, label: translateSystem(locale, "Ready to pair") };
  }
  if (state === "preparing") {
    return { currentStep: 1, completed: false, label: translateSystem(locale, "Preparing connection") };
  }
  if (state === "waiting") {
    return { currentStep: 2, completed: false, label: translateSystem(locale, "Waiting for direct connection") };
  }
  if (state === "received") {
    return { currentStep: 3, completed: false, label: translateSystem(locale, "Data received; waiting for merge confirmation") };
  }
  if (state === "connected") {
    return {
      currentStep: 3,
      completed: false,
      label: role === "sender" ? translateSystem(locale, "Connected; ready to send") : translateSystem(locale, "Connected; waiting for data"),
    };
  }
  return { currentStep: 1, completed: false, label: translateSystem(locale, "Ready to continue pairing") };
}
