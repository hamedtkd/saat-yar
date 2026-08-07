import { base64UrlToBytes, bytesToBase64Url, bytesToText, textToBytes } from "./device-transfer-codec.ts";
import {
  DEVICE_PAIRING_PROTOCOL,
  DEVICE_PAIRING_VERSION,
  type DevicePairingAnswer,
  type DevicePairingOffer,
  type DevicePairingSignal,
} from "./device-pairing-types.ts";

const PAIRING_PREFIX = "saatyar-pair:";
const HASH_KEY = "device-pair";

function assertDescription(value: unknown, expected: "offer" | "answer"): asserts value is RTCSessionDescriptionInit {
  if (!value || typeof value !== "object") throw new Error("اطلاعات WebRTC ناقص است.");
  const candidate = value as RTCSessionDescriptionInit;
  if (candidate.type !== expected || typeof candidate.sdp !== "string" || !candidate.sdp) {
    throw new Error("نوع پیام Pairing معتبر نیست.");
  }
}

function assertBase(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object") throw new Error("کد اتصال معتبر نیست.");
  const candidate = value as Record<string, unknown>;
  if (candidate.protocol !== DEVICE_PAIRING_PROTOCOL || candidate.version !== DEVICE_PAIRING_VERSION) {
    throw new Error("نسخه کد اتصال پشتیبانی نمی‌شود.");
  }
  if (typeof candidate.pairingId !== "string" || typeof candidate.createdAt !== "string") {
    throw new Error("متادیتای کد اتصال ناقص است.");
  }
}

export function encodeDevicePairingSignal(signal: DevicePairingSignal): string {
  return `${PAIRING_PREFIX}${bytesToBase64Url(textToBytes(JSON.stringify(signal)))}`;
}

export function decodeDevicePairingSignal(value: string): DevicePairingSignal {
  const clean = extractPairingCode(value.trim());
  if (!clean.startsWith(PAIRING_PREFIX)) throw new Error("کد اتصال ساعت‌یار شناسایی نشد.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytesToText(base64UrlToBytes(clean.slice(PAIRING_PREFIX.length))));
  } catch {
    throw new Error("کد اتصال قابل خواندن نیست.");
  }
  assertBase(parsed);
  const candidate = parsed as unknown as DevicePairingSignal;
  if (candidate.kind === "offer") {
    assertDescription(candidate.description, "offer");
    if (!candidate.source || !candidate.sessionKey || typeof candidate.expiresAt !== "string") {
      throw new Error("Offer اتصال ناقص است.");
    }
    if (new Date(candidate.expiresAt).getTime() < Date.now()) throw new Error("کد اتصال منقضی شده است.");
    return candidate as DevicePairingOffer;
  }
  if (candidate.kind === "answer") {
    assertDescription(candidate.description, "answer");
    if (!candidate.source) throw new Error("Answer اتصال ناقص است.");
    return candidate as DevicePairingAnswer;
  }
  throw new Error("نوع کد اتصال معتبر نیست.");
}

export function createPairingLink(code: string, origin: string, pathname = "/settings"): string {
  return `${origin}${pathname}#${HASH_KEY}=${encodeURIComponent(code)}`;
}

export function extractPairingCode(value: string): string {
  if (value.startsWith(PAIRING_PREFIX)) return value;
  try {
    const url = new URL(value);
    const params = new URLSearchParams(url.hash.replace(/^#/, ""));
    return params.get(HASH_KEY) ?? value;
  } catch {
    return value;
  }
}

export function readPairingCodeFromLocation(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get(HASH_KEY) ?? "";
}
