import {
  base64UrlToBytes,
  bytesToBase64Url,
  bytesToText,
  textToBytes,
} from "./device-transfer-codec.ts";
import {
  DEVICE_TRANSFER_PROTOCOL,
  DEVICE_TRANSFER_PROTOCOL_VERSION,
  type DeviceTransferPayload,
  type DeviceTransferSessionKey,
  type EncryptedDeviceTransferEnvelope,
} from "./device-transfer-types.ts";
import { verifyDeviceTransferPayload } from "./device-transfer-payload.ts";
import { toArrayBuffer } from "./device-transfer-buffer.ts";

async function importSessionKey(secret: string): Promise<CryptoKey> {
  const bytes = base64UrlToBytes(secret);
  if (bytes.byteLength !== 32) throw new Error("کلید نشست انتقال معتبر نیست.");
  return globalThis.crypto.subtle.importKey("raw", toArrayBuffer(bytes), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export function createDeviceTransferSessionKey(): DeviceTransferSessionKey {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  return { keyId: globalThis.crypto.randomUUID(), secret: bytesToBase64Url(bytes) };
}

export async function encryptDeviceTransferPayload(
  payload: DeviceTransferPayload,
  session: DeviceTransferSessionKey,
): Promise<EncryptedDeviceTransferEnvelope> {
  const key = await importSessionKey(session.secret);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(textToBytes(JSON.stringify(payload))),
  );
  return {
    protocol: DEVICE_TRANSFER_PROTOCOL,
    protocolVersion: DEVICE_TRANSFER_PROTOCOL_VERSION,
    transferId: payload.transferId,
    keyId: session.keyId,
    algorithm: "AES-GCM-256",
    iv: bytesToBase64Url(iv),
    ciphertext: bytesToBase64Url(new Uint8Array(encrypted)),
  };
}

export async function decryptDeviceTransferEnvelope(
  envelope: EncryptedDeviceTransferEnvelope,
  session: DeviceTransferSessionKey,
): Promise<DeviceTransferPayload> {
  if (envelope.protocol !== DEVICE_TRANSFER_PROTOCOL || envelope.protocolVersion !== DEVICE_TRANSFER_PROTOCOL_VERSION) {
    throw new Error("نسخه بسته رمزنگاری‌شده پشتیبانی نمی‌شود.");
  }
  if (envelope.algorithm !== "AES-GCM-256" || envelope.keyId !== session.keyId) {
    throw new Error("کلید نشست با بسته انتقال تطابق ندارد.");
  }
  const key = await importSessionKey(session.secret);
  let plaintext: ArrayBuffer;
  try {
    plaintext = await globalThis.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(base64UrlToBytes(envelope.iv)) },
      key,
      toArrayBuffer(base64UrlToBytes(envelope.ciphertext)),
    );
  } catch {
    throw new Error("رمزگشایی بسته انتقال ناموفق بود.");
  }
  return verifyDeviceTransferPayload(JSON.parse(bytesToText(new Uint8Array(plaintext))));
}
