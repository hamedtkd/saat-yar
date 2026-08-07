"use client";

import * as React from "react";
import { Camera, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addDevicePairingQrFrame,
  getDevicePairingQrProgress,
  type DevicePairingQrCollection,
} from "@/lib/device-pairing-qr";

type DetectedBarcode = { rawValue?: string };
type BarcodeDetectorLike = { detect(source: HTMLVideoElement): Promise<DetectedBarcode[]> };
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

function getBarcodeDetector(): BarcodeDetectorConstructor | null {
  const candidate = (globalThis as typeof globalThis & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
  return candidate ?? null;
}

export function DevicePairingQrScanner({ onCode, onClose }: {
  onCode: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const onCodeRef = React.useRef(onCode);
  const [error, setError] = React.useState("");
  const [collection, setCollection] = React.useState<DevicePairingQrCollection | null>(null);
  const progress = getDevicePairingQrProgress(collection);

  React.useEffect(() => { onCodeRef.current = onCode; }, [onCode]);

  React.useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    let timer = 0;

    async function start() {
      await Promise.resolve();
      const Detector = getBarcodeDetector();
      if (!Detector) {
        if (active) setError("اسکن QR داخل این مرورگر در دسترس نیست؛ از Copy/Paste کد اتصال استفاده کن.");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        if (active) setError("دسترسی دوربین در این مرورگر در دسترس نیست.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        const video = videoRef.current;
        if (!video || !active) return;
        video.srcObject = stream;
        await video.play();
        const detector = new Detector({ formats: ["qr_code"] });

        const scan = async () => {
          if (!active) return;
          try {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              const codes = await detector.detect(video);
              const rawValue = codes.find((item) => item.rawValue)?.rawValue;
              if (rawValue) {
                setCollection((current) => {
                  try {
                    const result = addDevicePairingQrFrame(current, rawValue);
                    if (result.completeCode) window.setTimeout(() => onCodeRef.current(result.completeCode as string), 0);
                    return result.collection;
                  } catch (value) {
                    window.setTimeout(() => setError(value instanceof Error ? value.message : "QR قابل خواندن نیست."), 0);
                    return current;
                  }
                });
              }
            }
          } catch {
            // A transient decode miss is normal while the camera is moving.
          }
          if (active) timer = window.setTimeout(() => void scan(), 180);
        };
        void scan();
      } catch (value) {
        if (active) setError(value instanceof Error ? `دوربین باز نشد: ${value.message}` : "دسترسی دوربین داده نشد.");
      }
    }

    void start();
    return () => {
      active = false;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  return (
    <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3" data-device-pairing-scanner>
      <div className="mb-2 flex items-center justify-between gap-2">
        <strong className="flex items-center gap-2 text-xs"><Camera className="size-4 text-[var(--accent-strong)]" /> اسکن QR اتصال</strong>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="بستن اسکنر"><X /></Button>
      </div>
      <div className="relative overflow-hidden rounded-xl bg-black">
        <video ref={videoRef} muted playsInline className="aspect-square w-full object-cover" />
        <div className="pointer-events-none absolute inset-[12%] rounded-2xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,.25)]" />
      </div>
      {progress.total > 1 && (
        <div className="mt-3 rounded-xl bg-[var(--accent-soft)] p-2 text-center text-[10px] font-bold text-[var(--accent-strong)]">
          <CheckCircle2 className="ml-1 inline size-3.5" /> {progress.current.toLocaleString("fa-IR")} از {progress.total.toLocaleString("fa-IR")} فریم دریافت شد
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-[10px] leading-6 text-[var(--danger)]">{error}</p>}
      <p className="mt-2 text-[9px] leading-5 text-[var(--text-muted)]">QR فقط داخل همین مرورگر پردازش می‌شود و تصویر دوربین برای هیچ سروری ارسال نمی‌شود.</p>
    </div>
  );
}
