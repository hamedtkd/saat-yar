const QR_FRAME_PREFIX = "SYQR1";
export const DEVICE_PAIRING_QR_CHUNK_SIZE = 620;

export type DevicePairingQrFrame = {
  batchId: string;
  index: number;
  total: number;
  checksum: string;
  chunk: string;
};

export type DevicePairingQrCollection = {
  batchId: string;
  total: number;
  checksum: string;
  chunks: Record<number, string>;
};

function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(7, "0");
}

function batchIdFor(value: string): string {
  return `${fnv1a(value.slice(0, 1024))}${value.length.toString(36)}`.slice(0, 12);
}

export function createDevicePairingQrFrames(code: string, chunkSize = DEVICE_PAIRING_QR_CHUNK_SIZE): string[] {
  if (!code) return [];
  if (!Number.isInteger(chunkSize) || chunkSize < 120) throw new Error("اندازه قطعه QR معتبر نیست.");
  const checksum = fnv1a(code);
  const batchId = batchIdFor(code);
  const total = Math.ceil(code.length / chunkSize);
  return Array.from({ length: total }, (_, index) => {
    const chunk = code.slice(index * chunkSize, (index + 1) * chunkSize);
    return `${QR_FRAME_PREFIX}|${batchId}|${index + 1}|${total}|${checksum}|${chunk}`;
  });
}

export function parseDevicePairingQrFrame(value: string): DevicePairingQrFrame | null {
  if (!value.startsWith(`${QR_FRAME_PREFIX}|`)) return null;
  const parts = value.split("|");
  if (parts.length < 6) throw new Error("فریم QR اتصال ناقص است.");
  const [, batchId, rawIndex, rawTotal, checksum, ...chunkParts] = parts;
  const index = Number(rawIndex);
  const total = Number(rawTotal);
  const chunk = chunkParts.join("|");
  if (!batchId || !checksum || !Number.isInteger(index) || !Number.isInteger(total) || index < 1 || total < 1 || index > total || total > 99) {
    throw new Error("فریم QR اتصال معتبر نیست.");
  }
  return { batchId, index, total, checksum, chunk };
}

export function addDevicePairingQrFrame(
  collection: DevicePairingQrCollection | null,
  rawValue: string,
): { collection: DevicePairingQrCollection | null; completeCode: string | null; added: boolean } {
  const frame = parseDevicePairingQrFrame(rawValue);
  if (!frame) return { collection, completeCode: rawValue, added: true };
  if (collection && (collection.batchId !== frame.batchId || collection.total !== frame.total || collection.checksum !== frame.checksum)) {
    collection = null;
  }
  const next: DevicePairingQrCollection = collection ?? {
    batchId: frame.batchId,
    total: frame.total,
    checksum: frame.checksum,
    chunks: {},
  };
  const added = next.chunks[frame.index] !== frame.chunk;
  const chunks = added ? { ...next.chunks, [frame.index]: frame.chunk } : next.chunks;
  const updated = { ...next, chunks };
  if (Object.keys(chunks).length !== updated.total) return { collection: updated, completeCode: null, added };
  const completeCode = Array.from({ length: updated.total }, (_, index) => chunks[index + 1] ?? "").join("");
  if (fnv1a(completeCode) !== updated.checksum) throw new Error("QR کامل شد اما Checksum کد اتصال معتبر نیست.");
  return { collection: updated, completeCode, added };
}

export function getDevicePairingQrProgress(collection: DevicePairingQrCollection | null): { current: number; total: number } {
  if (!collection) return { current: 0, total: 0 };
  return { current: Object.keys(collection.chunks).length, total: collection.total };
}
