"use client";

import * as React from "react";
import { Camera, CheckCircle2, X } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import { addDevicePairingQrFrame, getDevicePairingQrProgress, type DevicePairingQrCollection } from "@/lib/device-pairing-qr";
import { localizeSystemRuntimeError } from "@/lib/i18n/runtime-error";

type DetectedBarcode = { rawValue?: string };
type BarcodeDetectorLike = { detect(source: HTMLVideoElement): Promise<DetectedBarcode[]> };
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;
function getBarcodeDetector(): BarcodeDetectorConstructor | null { const candidate = (globalThis as typeof globalThis & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector; return candidate ?? null; }

export function DevicePairingQrScanner({ onCode, onClose }: { onCode: (code: string) => void; onClose: () => void }) {
  const { locale, number, s } = useSystemUi();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const onCodeRef = React.useRef(onCode);
  const [error, setError] = React.useState("");
  const [collection, setCollection] = React.useState<DevicePairingQrCollection | null>(null);
  const progress = getDevicePairingQrProgress(collection);
  React.useEffect(() => { onCodeRef.current = onCode; }, [onCode]);
  React.useEffect(() => {
    let active = true; let stream: MediaStream | null = null; let videoElement: HTMLVideoElement | null = null; let timer = 0;
    async function start() {
      await Promise.resolve();
      const Detector = getBarcodeDetector();
      if (!Detector) { if (active) setError(s("QR scanning is not available in this browser; use Copy/Paste for the connection code.")); return; }
      if (!navigator.mediaDevices?.getUserMedia) { if (active) setError(s("Camera access is not available in this browser.")); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        videoElement = videoRef.current; const video = videoElement; if (!video || !active) return; video.srcObject = stream; await video.play();
        const detector = new Detector({ formats: ["qr_code"] });
        const scan = async () => {
          if (!active) return;
          try {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              const codes = await detector.detect(video); const rawValue = codes.find((item) => item.rawValue)?.rawValue;
              if (rawValue) setCollection((current) => { try { const result = addDevicePairingQrFrame(current, rawValue, locale); if (result.completeCode) window.setTimeout(() => onCodeRef.current(result.completeCode as string), 0); return result.collection; } catch (value) { window.setTimeout(() => setError(localizeSystemRuntimeError(locale, value, "QR could not be read.")), 0); return current; } });
            }
          } catch { /* transient decode miss */ }
          if (active) timer = window.setTimeout(() => void scan(), 180);
        };
        void scan();
      } catch (value) { if (active) setError(s("Camera could not open: {error}", { error: localizeSystemRuntimeError(locale, value, "Camera access was not granted.") })); }
    }
    void start();
    return () => { active = false; window.clearTimeout(timer); stream?.getTracks().forEach((track) => track.stop()); if (videoElement) videoElement.srcObject = null; };
  }, [locale, s]);

  return (
    <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3" data-device-pairing-scanner>
      <div className="mb-2 flex items-center justify-between gap-2"><strong className="flex items-center gap-2 text-xs"><Camera className="size-4 text-[var(--accent-strong)]" /> {s("Scan connection QR")}</strong><Button size="icon" variant="ghost" onClick={onClose} aria-label={s("Close scanner")}><X /></Button></div>
      <div className="relative overflow-hidden rounded-xl bg-black"><video ref={videoRef} muted playsInline className="aspect-square w-full object-cover" /><div className="pointer-events-none absolute inset-[12%] rounded-2xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,.25)]" /></div>
      {progress.total > 1 && <div className="mt-3 rounded-xl bg-[var(--accent-soft)] p-2 text-center text-[10px] font-bold text-[var(--accent-strong)]"><CheckCircle2 className="me-1 inline size-3.5" /> {s("{current} of {total} frames received", { current: number(progress.current), total: number(progress.total) })}</div>}
      {error && <p role="alert" className="mt-2 text-[10px] leading-6 text-[var(--danger)]">{error}</p>}
      <p className="mt-2 text-[9px] leading-5 text-[var(--text-muted)]">{s("QR is processed only in this browser and camera images are never sent to a server.")}</p>
    </div>
  );
}
