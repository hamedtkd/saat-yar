"use client";

import * as React from "react";
import {
  createPairingLink,
  decodeDevicePairingSignal,
  encodeDevicePairingSignal,
  readPairingCodeFromLocation,
} from "@/lib/device-pairing-codec";
import {
  acceptDevicePairingAnswer,
  createDevicePairingAnswer,
  createDevicePairingOffer,
} from "@/lib/device-pairing-peer";
import { listenForDeviceTransferEnvelope, sendDeviceTransferEnvelope } from "@/lib/device-pairing-channel";
import { createLocalDeviceSource } from "@/lib/device-pairing-source";
import {
  applyDeviceTransfer,
  createDeviceTransferPayload,
  decryptDeviceTransferEnvelope,
  encryptDeviceTransferPayload,
  previewDeviceTransfer,
} from "@/lib/device-transfer";
import type {
  DeviceTransferApplyMode,
  DeviceTransferConflictResolution,
  DeviceTransferPayload,
  DeviceTransferPreview,
  DeviceTransferSessionKey,
} from "@/lib/device-transfer-types";
import type { DevicePairingOffer } from "@/lib/device-pairing-types";
import {
  appendDeviceTransferHistory,
  clearDeviceTransferHistory,
  getDeviceTransferHistorySnapshot,
  parseDeviceTransferHistory,
  subscribeDeviceTransferHistory,
} from "@/lib/device-transfer-history";
import type { DeviceTransferSource } from "@/lib/device-transfer-types";
import type { AppData } from "@/lib/types";

type Role = "idle" | "sender" | "receiver";
type ConnectionState = "idle" | "preparing" | "waiting" | "connected" | "received" | "completed" | "error";

export function useDeviceTransferPairing({ data, setData, setToast }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
}) {
  const [role, setRole] = React.useState<Role>("idle");
  const [state, setState] = React.useState<ConnectionState>("idle");
  const [localCode, setLocalCode] = React.useState("");
  const [remoteCode, setRemoteCode] = React.useState(() => readPairingCodeFromLocation());
  const [error, setError] = React.useState("");
  const [incoming, setIncoming] = React.useState<DeviceTransferPayload | null>(null);
  const [preview, setPreview] = React.useState<DeviceTransferPreview | null>(null);
  const [acknowledged, setAcknowledged] = React.useState(false);
  const historySnapshot = React.useSyncExternalStore(
    subscribeDeviceTransferHistory,
    getDeviceTransferHistorySnapshot,
    () => "[]",
  );
  const history = React.useMemo(() => parseDeviceTransferHistory(historySnapshot), [historySnapshot]);
  const peerRef = React.useRef<RTCPeerConnection | null>(null);
  const channelRef = React.useRef<RTCDataChannel | null>(null);
  const sessionKeyRef = React.useRef<DeviceTransferSessionKey | null>(null);
  const offerRef = React.useRef<DevicePairingOffer | null>(null);
  const remoteSourceRef = React.useRef<DeviceTransferSource | null>(null);
  const stopListenerRef = React.useRef<(() => void) | null>(null);

  const fail = React.useCallback((value: unknown) => {
    const message = value instanceof Error ? value.message : "اتصال دستگاه ناموفق بود.";
    setError(message);
    setState("error");
  }, []);

  const attachChannel = React.useCallback((channel: RTCDataChannel, sessionKey: DeviceTransferSessionKey) => {
    channelRef.current = channel;
    sessionKeyRef.current = sessionKey;
    const onOpen = () => setState("connected");
    const onClose = () => setState((current) => current === "received" || current === "completed" ? current : "idle");
    channel.addEventListener("open", onOpen);
    channel.addEventListener("close", onClose);
    stopListenerRef.current?.();
    const stopEnvelope = listenForDeviceTransferEnvelope(channel, (envelope) => {
      void decryptDeviceTransferEnvelope(envelope, sessionKey)
        .then((payload) => {
          setIncoming(payload);
          setPreview(previewDeviceTransfer(data, payload.data, "merge"));
          setState("received");
        })
        .catch(fail);
    }, () => {
      setAcknowledged(true);
      setState("completed");
      const remote = remoteSourceRef.current;
      appendDeviceTransferHistory({
        id: `sent:${globalThis.crypto.randomUUID()}`,
        at: new Date().toISOString(),
        direction: "sent",
        deviceName: remote?.deviceName ?? "دستگاه مقابل",
        status: "acknowledged",
      });
    });
    stopListenerRef.current = () => {
      stopEnvelope();
      channel.removeEventListener("open", onOpen);
      channel.removeEventListener("close", onClose);
    };
  }, [data, fail]);

  const closeTransport = React.useCallback(() => {
    stopListenerRef.current?.();
    stopListenerRef.current = null;
    channelRef.current?.close();
    peerRef.current?.close();
    channelRef.current = null;
    peerRef.current = null;
    sessionKeyRef.current = null;
    offerRef.current = null;
    remoteSourceRef.current = null;
  }, []);

  const reset = React.useCallback(() => {
    closeTransport();
    setRole("idle");
    setState("idle");
    setLocalCode("");
    setRemoteCode("");
    setIncoming(null);
    setPreview(null);
    setAcknowledged(false);
    setError("");
  }, [closeTransport]);

  React.useEffect(() => () => closeTransport(), [closeTransport]);

  const prepareReceiver = React.useCallback(() => {
    const code = remoteCode || readPairingCodeFromLocation();
    reset();
    setRemoteCode(code);
    setRole("receiver");
    setState("idle");
  }, [remoteCode, reset]);

  const startSender = React.useCallback(async () => {
    try {
      reset();
      setRole("sender");
      setState("preparing");
      const result = await createDevicePairingOffer(createLocalDeviceSource());
      peerRef.current = result.peer;
      offerRef.current = result.offer;
      attachChannel(result.channel, result.offer.sessionKey);
      setLocalCode(encodeDevicePairingSignal(result.offer));
      setState("waiting");
    } catch (value) { fail(value); }
  }, [attachChannel, fail, reset]);

  const startReceiver = React.useCallback(async (code = remoteCode) => {
    try {
      setRole("receiver");
      setState("preparing");
      setError("");
      const signal = decodeDevicePairingSignal(code);
      if (signal.kind !== "offer") throw new Error("برای دستگاه دریافت‌کننده باید Offer وارد شود.");
      remoteSourceRef.current = signal.source;
      const result = await createDevicePairingAnswer(signal, createLocalDeviceSource());
      peerRef.current = result.peer;
      sessionKeyRef.current = result.sessionKey;
      result.channelPromise.then((channel) => attachChannel(channel, result.sessionKey)).catch(fail);
      setLocalCode(encodeDevicePairingSignal(result.answer));
      setState("waiting");
    } catch (value) { fail(value); }
  }, [attachChannel, fail, remoteCode]);

  const acceptAnswer = React.useCallback(async (code = remoteCode) => {
    try {
      const peer = peerRef.current;
      const offer = offerRef.current;
      if (!peer || !offer) throw new Error("ابتدا Offer این دستگاه را بساز.");
      const signal = decodeDevicePairingSignal(code);
      if (signal.kind !== "answer") throw new Error("کد واردشده Answer نیست.");
      remoteSourceRef.current = signal.source;
      await acceptDevicePairingAnswer(peer, offer.pairingId, signal);
      setState("waiting");
      setError("");
    } catch (value) { fail(value); }
  }, [fail, remoteCode]);

  const sendCurrentData = React.useCallback(async () => {
    try {
      const channel = channelRef.current;
      const sessionKey = sessionKeyRef.current;
      if (!channel || !sessionKey) throw new Error("اتصال مستقیم آماده نیست.");
      setAcknowledged(false);
      setState("connected");
      const payload = await createDeviceTransferPayload(data, createLocalDeviceSource());
      const envelope = await encryptDeviceTransferPayload(payload, sessionKey);
      sendDeviceTransferEnvelope(channel, envelope);
      setToast("داده رمزنگاری‌شده ارسال شد؛ منتظر تأیید دستگاه مقابل هستیم.");
    } catch (value) { fail(value); }
  }, [data, fail, setToast]);

  const applyIncoming = React.useCallback((mode: DeviceTransferApplyMode, conflicts: DeviceTransferConflictResolution) => {
    if (!incoming) return;
    const currentPreview = preview;
    const additions = currentPreview
      ? Object.values(currentPreview.collections).reduce((sum, item) => sum + item.additions, 0)
      : 0;
    setData((current) => applyDeviceTransfer(current, incoming.data, { mode, conflicts }));
    appendDeviceTransferHistory({
      id: `received:${incoming.transferId}`,
      at: new Date().toISOString(),
      direction: "received",
      deviceName: incoming.source.deviceName,
      status: "applied",
      additions,
      conflicts: currentPreview?.conflictCount ?? 0,
      mode,
      conflictResolution: conflicts,
    });
    setToast(mode === "replace" ? "داده این دستگاه با انتقال جدید جایگزین شد." : "داده دستگاه مقابل با اطلاعات محلی ادغام شد.");
    setIncoming(null);
    setPreview(null);
    setState("completed");
  }, [incoming, preview, setData, setToast]);

  const clearHistory = React.useCallback(() => {
    clearDeviceTransferHistory();
    setToast("تاریخچه انتقال پاک شد.");
  }, [setToast]);

  const pairingLink = React.useMemo(() => {
    if (!localCode || typeof window === "undefined") return "";
    return createPairingLink(localCode, window.location.origin);
  }, [localCode]);

  return {
    role, state, localCode, remoteCode, setRemoteCode, error, incoming, preview, acknowledged, pairingLink, history,
    startSender, prepareReceiver, startReceiver, acceptAnswer, sendCurrentData, applyIncoming, clearHistory, reset,
  };
}
