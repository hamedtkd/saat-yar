import type { DeviceTransferSource } from "./device-transfer-types.ts";

export function createLocalDeviceSource(): DeviceTransferSource {
  const platform = typeof navigator === "undefined" ? "unknown" : navigator.platform || navigator.userAgent;
  const mobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  return {
    deviceId: globalThis.crypto.randomUUID(),
    deviceName: mobile ? "موبایل" : "رایانه",
    platform,
  };
}
