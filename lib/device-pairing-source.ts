import { translateSystem } from "./i18n/system.ts";
import type { Locale } from "./i18n/locales.ts";
import type { DeviceTransferSource } from "./device-transfer-types.ts";

export function createLocalDeviceSource(locale: Locale = "fa-IR"): DeviceTransferSource {
  const platform = typeof navigator === "undefined" ? "unknown" : navigator.platform || navigator.userAgent;
  const mobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  return {
    deviceId: globalThis.crypto.randomUUID(),
    deviceName: mobile ? translateSystem(locale, "Mobile") : translateSystem(locale, "Computer"),
    platform,
  };
}
