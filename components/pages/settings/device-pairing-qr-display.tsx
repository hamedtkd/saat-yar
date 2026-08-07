"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Pause, Play, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDevicePairingQrFrames } from "@/lib/device-pairing-qr";
import { createLocalQrMatrix, createQrSvgPath } from "@/lib/local-qr";

const FRAME_INTERVAL_MS = 850;

export function DevicePairingQrDisplay({ code }: { code: string }) {
  const frames = React.useMemo(() => createDevicePairingQrFrames(code), [code]);
  const [frameIndex, setFrameIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const frame = frames[frameIndex] ?? "";
  const matrix = React.useMemo(() => createLocalQrMatrix(frame), [frame]);
  const path = React.useMemo(() => createQrSvgPath(matrix), [matrix]);
  const multiFrame = frames.length > 1;

  React.useEffect(() => {
    if (!multiFrame || paused) return;
    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, FRAME_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [frames.length, multiFrame, paused]);

  return (
    <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-3 text-slate-950" data-device-pairing-qr>
      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-bold">
        <span className="flex items-center gap-1.5"><QrCode className="size-4" /> اسکن سریع با ساعت‌یار</span>
        {multiFrame && <span dir="ltr">{frameIndex + 1}/{frames.length}</span>}
      </div>
      <svg
        className="mx-auto block aspect-square w-full max-w-[280px]"
        viewBox={`${-4} ${-4} ${matrix.size + 8} ${matrix.size + 8}`}
        role="img"
        aria-label={multiFrame ? `QR اتصال، فریم ${frameIndex + 1} از ${frames.length}` : "QR اتصال ساعت‌یار"}
        shapeRendering="crispEdges"
      >
        <rect x={-4} y={-4} width={matrix.size + 8} height={matrix.size + 8} fill="white" />
        <path d={path} fill="black" />
      </svg>
      {multiFrame && (
        <>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Button size="sm" variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50" onClick={() => setFrameIndex((current) => (current - 1 + frames.length) % frames.length)} aria-label="فریم قبلی"><ChevronRight /></Button>
            <Button size="sm" variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50" onClick={() => setPaused((value) => !value)}>{paused ? <Play /> : <Pause />} {paused ? "ادامه" : "مکث"}</Button>
            <Button size="sm" variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50" onClick={() => setFrameIndex((current) => (current + 1) % frames.length)} aria-label="فریم بعدی"><ChevronLeft /></Button>
          </div>
          <p className="mt-2 text-center text-[9px] leading-5 text-slate-600">کد اتصال بزرگ است؛ QR به {frames.length.toLocaleString("fa-IR")} فریم تقسیم شده و خودکار می‌چرخد. دوربین را ثابت نگه دار تا همه فریم‌ها جمع شوند.</p>
        </>
      )}
    </div>
  );
}
