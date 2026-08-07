import { pickAppData } from "./data/app-data-contract.ts";
import { hasAppDataContractDiff, inspectAppDataContract } from "./data/app-data-audit.ts";
import { migrateAppData } from "./data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "./data/version.ts";
import { bytesToBase64Url, stableStringify, textToBytes } from "./device-transfer-codec.ts";
import {
  DEVICE_TRANSFER_PROTOCOL,
  DEVICE_TRANSFER_PROTOCOL_VERSION,
  type DeviceTransferPayload,
  type DeviceTransferSource,
} from "./device-transfer-types.ts";
import type { AppData } from "./types.ts";

function randomId(): string {
  return globalThis.crypto.randomUUID();
}

async function sha256(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", textToBytes(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

function checksumInput(payload: Omit<DeviceTransferPayload, "checksum">): string {
  return stableStringify(payload);
}

export async function createDeviceTransferPayload(
  data: AppData,
  source: DeviceTransferSource,
  createdAt = new Date().toISOString(),
): Promise<DeviceTransferPayload> {
  const unsigned: Omit<DeviceTransferPayload, "checksum"> = {
    protocol: DEVICE_TRANSFER_PROTOCOL,
    protocolVersion: DEVICE_TRANSFER_PROTOCOL_VERSION,
    appName: "ساعت‌یار",
    appDataSchemaVersion: APP_DATA_SCHEMA_VERSION,
    transferId: randomId(),
    createdAt,
    source,
    data: pickAppData(data),
  };
  return { ...unsigned, checksum: await sha256(checksumInput(unsigned)) };
}

export async function verifyDeviceTransferPayload(value: unknown): Promise<DeviceTransferPayload> {
  if (!value || typeof value !== "object") throw new Error("بسته انتقال معتبر نیست.");
  const candidate = value as Partial<DeviceTransferPayload>;
  if (candidate.protocol !== DEVICE_TRANSFER_PROTOCOL) throw new Error("پروتکل انتقال پشتیبانی نمی‌شود.");
  if (candidate.protocolVersion !== DEVICE_TRANSFER_PROTOCOL_VERSION) throw new Error("نسخه پروتکل انتقال پشتیبانی نمی‌شود.");
  if (typeof candidate.checksum !== "string") throw new Error("Checksum بسته انتقال وجود ندارد.");
  if (typeof candidate.transferId !== "string" || typeof candidate.createdAt !== "string" || !candidate.source) {
    throw new Error("متادیتای بسته انتقال ناقص است.");
  }
  if (typeof candidate.appDataSchemaVersion !== "number" || candidate.appDataSchemaVersion > APP_DATA_SCHEMA_VERSION) {
    throw new Error("نسخه داده دستگاه فرستنده جدیدتر از این نسخه ساعت‌یار است.");
  }

  const { checksum, ...unsigned } = candidate as DeviceTransferPayload;
  const expected = await sha256(checksumInput(unsigned));
  if (checksum !== expected) throw new Error("Checksum بسته انتقال تطابق ندارد.");

  let data: AppData;
  try {
    data = migrateAppData({ schemaVersion: candidate.appDataSchemaVersion, data: candidate.data }).data;
  } catch {
    throw new Error("داده داخل بسته انتقال قابل بازیابی نیست.");
  }
  const diff = inspectAppDataContract(data);
  if (hasAppDataContractDiff(diff)) throw new Error("قرارداد AppData بسته انتقال معتبر نیست.");
  return { ...(candidate as DeviceTransferPayload), data: pickAppData(data) };
}
