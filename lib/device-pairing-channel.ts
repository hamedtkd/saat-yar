import type { EncryptedDeviceTransferEnvelope } from "./device-transfer-types.ts";

const CHUNK_SIZE = 12_000;

type WireMessage =
  | { kind: "start"; transferId: string; chunks: number }
  | { kind: "chunk"; transferId: string; index: number; value: string }
  | { kind: "end"; transferId: string }
  | { kind: "ack"; transferId: string };

export function sendDeviceTransferEnvelope(channel: RTCDataChannel, envelope: EncryptedDeviceTransferEnvelope) {
  if (channel.readyState !== "open") throw new Error("اتصال مستقیم هنوز آماده نیست.");
  const body = JSON.stringify(envelope);
  const chunks = Math.ceil(body.length / CHUNK_SIZE);
  channel.send(JSON.stringify({ kind: "start", transferId: envelope.transferId, chunks } satisfies WireMessage));
  for (let index = 0; index < chunks; index += 1) {
    channel.send(JSON.stringify({
      kind: "chunk",
      transferId: envelope.transferId,
      index,
      value: body.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
    } satisfies WireMessage));
  }
  channel.send(JSON.stringify({ kind: "end", transferId: envelope.transferId } satisfies WireMessage));
}

export function listenForDeviceTransferEnvelope(
  channel: RTCDataChannel,
  onEnvelope: (envelope: EncryptedDeviceTransferEnvelope) => void,
  onAck?: (transferId: string) => void,
) {
  let transferId = "";
  let expectedChunks = 0;
  let chunks: string[] = [];
  const onMessage = (event: MessageEvent<string>) => {
    let message: WireMessage;
    try { message = JSON.parse(event.data) as WireMessage; } catch { return; }
    if (message.kind === "ack") return onAck?.(message.transferId);
    if (message.kind === "start") {
      transferId = message.transferId;
      expectedChunks = message.chunks;
      chunks = new Array(message.chunks);
      return;
    }
    if (message.transferId !== transferId) return;
    if (message.kind === "chunk") {
      chunks[message.index] = message.value;
      return;
    }
    if (message.kind === "end" && chunks.filter(Boolean).length === expectedChunks) {
      const envelope = JSON.parse(chunks.join("")) as EncryptedDeviceTransferEnvelope;
      onEnvelope(envelope);
      channel.send(JSON.stringify({ kind: "ack", transferId } satisfies WireMessage));
      transferId = "";
      expectedChunks = 0;
      chunks = [];
    }
  };
  channel.addEventListener("message", onMessage);
  return () => channel.removeEventListener("message", onMessage);
}
