import type { DeviceTransferSessionKey, DeviceTransferSource } from "./device-transfer-types.ts";

export const DEVICE_PAIRING_PROTOCOL = "saatyar-device-pair" as const;
export const DEVICE_PAIRING_VERSION = 1 as const;
export const DEVICE_PAIRING_TTL_MS = 10 * 60 * 1000;

export type DevicePairingOffer = {
  protocol: typeof DEVICE_PAIRING_PROTOCOL;
  version: typeof DEVICE_PAIRING_VERSION;
  kind: "offer";
  pairingId: string;
  createdAt: string;
  expiresAt: string;
  source: DeviceTransferSource;
  sessionKey: DeviceTransferSessionKey;
  description: RTCSessionDescriptionInit;
};

export type DevicePairingAnswer = {
  protocol: typeof DEVICE_PAIRING_PROTOCOL;
  version: typeof DEVICE_PAIRING_VERSION;
  kind: "answer";
  pairingId: string;
  createdAt: string;
  source: DeviceTransferSource;
  description: RTCSessionDescriptionInit;
};

export type DevicePairingSignal = DevicePairingOffer | DevicePairingAnswer;
