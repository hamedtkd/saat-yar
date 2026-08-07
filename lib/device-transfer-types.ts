import type { AppData } from "./types.ts";
import type { AppDataCollectionKey } from "./data/app-data-contract.ts";

export const DEVICE_TRANSFER_PROTOCOL = "saatyar-device-transfer" as const;
export const DEVICE_TRANSFER_PROTOCOL_VERSION = 1 as const;

export type DeviceTransferApplyMode = "merge" | "replace";
export type DeviceTransferConflictResolution = "keep-local" | "use-incoming";

export type DeviceTransferSource = {
  deviceId: string;
  deviceName: string;
  platform?: string;
};

export type DeviceTransferPayload = {
  protocol: typeof DEVICE_TRANSFER_PROTOCOL;
  protocolVersion: typeof DEVICE_TRANSFER_PROTOCOL_VERSION;
  appName: "ساعت‌یار";
  appDataSchemaVersion: number;
  transferId: string;
  createdAt: string;
  source: DeviceTransferSource;
  checksum: string;
  data: AppData;
};

export type EncryptedDeviceTransferEnvelope = {
  protocol: typeof DEVICE_TRANSFER_PROTOCOL;
  protocolVersion: typeof DEVICE_TRANSFER_PROTOCOL_VERSION;
  transferId: string;
  keyId: string;
  algorithm: "AES-GCM-256";
  iv: string;
  ciphertext: string;
};

export type DeviceTransferSessionKey = {
  keyId: string;
  secret: string;
};

export type DeviceTransferConflict = {
  scope: "settings" | AppDataCollectionKey;
  key: string;
  label: string;
};

export type DeviceTransferCollectionPreview = {
  localCount: number;
  incomingCount: number;
  additions: number;
  conflicts: number;
};

export type DeviceTransferPreview = {
  mode: DeviceTransferApplyMode;
  settingsChanged: boolean;
  conflictCount: number;
  conflicts: DeviceTransferConflict[];
  collections: Record<AppDataCollectionKey, DeviceTransferCollectionPreview>;
};

export type DeviceTransferApplyOptions = {
  mode: DeviceTransferApplyMode;
  conflicts?: DeviceTransferConflictResolution;
};
