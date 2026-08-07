import { createDeviceTransferSessionKey } from "./device-transfer-crypto.ts";
import {
  DEVICE_PAIRING_PROTOCOL,
  DEVICE_PAIRING_TTL_MS,
  DEVICE_PAIRING_VERSION,
  type DevicePairingAnswer,
  type DevicePairingOffer,
} from "./device-pairing-types.ts";
import type { DeviceTransferSource } from "./device-transfer-types.ts";

const ICE_TIMEOUT_MS = 12_000;

function waitForIceGathering(peer: RTCPeerConnection): Promise<void> {
  if (peer.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const timer = window.setTimeout(done, ICE_TIMEOUT_MS);
    function done() {
      window.clearTimeout(timer);
      peer.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    }
    function onChange() {
      if (peer.iceGatheringState === "complete") done();
    }
    peer.addEventListener("icegatheringstatechange", onChange);
  });
}

function createPeer(): RTCPeerConnection {
  if (typeof RTCPeerConnection === "undefined") throw new Error("این مرورگر از WebRTC پشتیبانی نمی‌کند.");
  return new RTCPeerConnection({ iceServers: [] });
}

export async function createDevicePairingOffer(source: DeviceTransferSource) {
  const peer = createPeer();
  const channel = peer.createDataChannel("saatyar-transfer", { ordered: true });
  const sessionKey = createDeviceTransferSessionKey();
  const pairingId = globalThis.crypto.randomUUID();
  const createdAt = new Date();
  await peer.setLocalDescription(await peer.createOffer());
  await waitForIceGathering(peer);
  if (!peer.localDescription) throw new Error("ساخت Offer اتصال ناموفق بود.");
  const offer: DevicePairingOffer = {
    protocol: DEVICE_PAIRING_PROTOCOL,
    version: DEVICE_PAIRING_VERSION,
    kind: "offer",
    pairingId,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + DEVICE_PAIRING_TTL_MS).toISOString(),
    source,
    sessionKey,
    description: peer.localDescription.toJSON(),
  };
  return { peer, channel, offer };
}

export async function createDevicePairingAnswer(offer: DevicePairingOffer, source: DeviceTransferSource) {
  const peer = createPeer();
  const channelPromise = new Promise<RTCDataChannel>((resolve) => {
    peer.addEventListener("datachannel", (event) => resolve(event.channel), { once: true });
  });
  await peer.setRemoteDescription(offer.description);
  await peer.setLocalDescription(await peer.createAnswer());
  await waitForIceGathering(peer);
  if (!peer.localDescription) throw new Error("ساخت Answer اتصال ناموفق بود.");
  const answer: DevicePairingAnswer = {
    protocol: DEVICE_PAIRING_PROTOCOL,
    version: DEVICE_PAIRING_VERSION,
    kind: "answer",
    pairingId: offer.pairingId,
    createdAt: new Date().toISOString(),
    source,
    description: peer.localDescription.toJSON(),
  };
  return { peer, channelPromise, answer, sessionKey: offer.sessionKey };
}

export async function acceptDevicePairingAnswer(peer: RTCPeerConnection, pairingId: string, answer: DevicePairingAnswer) {
  if (answer.pairingId !== pairingId) throw new Error("Answer مربوط به این نشست Pairing نیست.");
  await peer.setRemoteDescription(answer.description);
}
