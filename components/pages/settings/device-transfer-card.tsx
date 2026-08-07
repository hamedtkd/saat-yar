"use client";

import * as React from "react";
import { ArrowRightLeft, CheckCircle2, Copy, Laptop, Link2, QrCode, RefreshCcw, Send, Share2, Smartphone, Wifi } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDeviceTransferPairing } from "@/hooks/use-device-transfer-pairing";
import { getDeviceTransferSessionView } from "@/lib/device-transfer-session-ui";
import type { AppData } from "@/lib/types";
import { DevicePairingQrDisplay } from "./device-pairing-qr-display";
import { DevicePairingQrScanner } from "./device-pairing-qr-scanner";
import { DeviceTransferPreviewPanel } from "./device-transfer-preview";
import { DeviceTransferHistory } from "./device-transfer-history";
import { DeviceTransferSteps } from "./device-transfer-steps";

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function DeviceTransferCard({ data, setData, setToast }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
}) {
  const pairing = useDeviceTransferPairing({ data, setData, setToast });
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const connected = pairing.state === "connected" || pairing.state === "received" || pairing.state === "completed";
  const sessionView = getDeviceTransferSessionView(pairing.role, pairing.state);

  const shareLocalLink = async () => {
    if (!pairing.pairingLink) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "اتصال ساعت‌یار", text: "این لینک Pairing فقط برای همین نشست است.", url: pairing.pairingLink });
        return;
      } catch { /* copy fallback */ }
    }
    await copyText(pairing.pairingLink);
    setToast("لینک Pairing کپی شد.");
  };

  const handleScannedCode = React.useCallback((code: string) => {
    pairing.setRemoteCode(code);
    setScannerOpen(false);
    setToast("QR اتصال کامل دریافت شد؛ مرحله بعد خودکار اجرا می‌شود.");
    if (pairing.role === "sender") void pairing.acceptAnswer(code);
    else void pairing.startReceiver(code);
  }, [pairing, setToast]);

  return (
    <section className="dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <PanelHead icon={<ArrowRightLeft />} title="انتقال بین موبایل و لپ‌تاپ" />
      <p className="mb-3 text-[11px] leading-7 text-[var(--text-muted)]">بدون حساب کاربری و دیتابیس مرکزی، دو دستگاه را مستقیم WebRTC وصل کن و AppData رمزنگاری‌شده را انتقال بده.</p>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2" data-device-transfer-session-status>
        <span className="text-[10px] font-bold">وضعیت نشست</span>
        <span className="text-[10px] text-[var(--accent-strong)]">{sessionView.label}</span>
      </div>
      <DeviceTransferSteps role={pairing.role} state={pairing.state} />

      {pairing.role === "idle" && (
        <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
          <button type="button" onClick={() => void pairing.startSender()} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-right hover:border-[var(--accent)]">
            <Laptop className="mb-3 size-6 text-[var(--accent-strong)]" /><strong className="block text-sm">ارسال از این دستگاه</strong><span className="mt-1 block text-[10px] leading-6 text-[var(--text-muted)]">برای دستگاهی که داده اصلی روی آن است.</span>
          </button>
          <button type="button" onClick={pairing.prepareReceiver} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-right hover:border-[var(--accent)]">
            <Smartphone className="mb-3 size-6 text-[var(--accent-strong)]" /><strong className="block text-sm">دریافت روی این دستگاه</strong><span className="mt-1 block text-[10px] leading-6 text-[var(--text-muted)]">QR را اسکن کن یا کد Pairing را وارد کن.</span>
          </button>
        </div>
      )}

      {(pairing.role === "idle" || pairing.role === "receiver") && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2"><label className="block text-[10px] font-bold">Offer / لینک Pairing</label><Button size="sm" variant="outline" onClick={() => setScannerOpen((value) => !value)}><QrCode /> اسکن QR</Button></div>
          {scannerOpen && <DevicePairingQrScanner onCode={handleScannedCode} onClose={() => setScannerOpen(false)} />}
          <Textarea value={pairing.remoteCode} onChange={(event) => pairing.setRemoteCode(event.target.value)} placeholder="saatyar-pair:... یا لینک ساعت‌یار" className="mt-2 min-h-24 break-all text-left text-[10px]" dir="ltr" />
          <Button className="mt-2 w-full" disabled={!pairing.remoteCode || pairing.state === "preparing"} onClick={() => void pairing.startReceiver()}><Wifi /> ساخت پاسخ و اتصال</Button>
        </div>
      )}

      {pairing.localCode && (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-2 flex items-center justify-between gap-2"><strong className="text-xs">{pairing.role === "sender" ? "Offer این دستگاه" : "Answer این دستگاه"}</strong><span className="text-[9px] text-[var(--text-muted)]">اعتبار Offer: ۱۰ دقیقه</span></div>
          <DevicePairingQrDisplay key={pairing.localCode} code={pairing.localCode} />
          <Textarea readOnly value={pairing.localCode} className="mt-3 min-h-20 text-left text-[9px]" dir="ltr" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => void copyText(pairing.localCode).then(() => setToast("کد Pairing کپی شد."))}><Copy /> کپی کد</Button>
            <Button size="sm" variant="outline" onClick={() => void shareLocalLink()}><Share2 /> اشتراک لینک</Button>
          </div>
          <p className="mt-2 flex items-start gap-2 text-[9px] leading-5 text-[var(--text-muted)]"><Link2 className="mt-0.5 size-3 flex-none" />QR و لینک فقط داخل دستگاه ساخته می‌شوند. کد Session شامل کلید موقت انتقال است؛ آن را عمومی منتشر نکن.</p>
        </div>
      )}

      {pairing.role === "sender" && pairing.localCode && !connected && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2"><label className="block text-[10px] font-bold">Answer دستگاه مقابل</label><Button size="sm" variant="outline" onClick={() => setScannerOpen((value) => !value)}><QrCode /> اسکن QR</Button></div>
          {scannerOpen && <DevicePairingQrScanner onCode={handleScannedCode} onClose={() => setScannerOpen(false)} />}
          <Textarea value={pairing.remoteCode} onChange={(event) => pairing.setRemoteCode(event.target.value)} placeholder="Answer را اسکن یا اینجا Paste کن" className="mt-2 min-h-20 text-left text-[10px]" dir="ltr" />
          <Button className="mt-2 w-full" disabled={!pairing.remoteCode} onClick={() => void pairing.acceptAnswer()}><Wifi /> تکمیل اتصال</Button>
        </div>
      )}

      {connected && (
        <div className="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] bg-[var(--accent-soft)] p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent-strong)]"><CheckCircle2 className="size-5" /> {pairing.state === "completed" ? "انتقال این نشست تکمیل شد" : "اتصال مستقیم برقرار است"}</div>
          {pairing.role === "sender" && pairing.state !== "completed" && <Button className="mt-3 w-full" onClick={() => void pairing.sendCurrentData()}><Send /> ارسال داده رمزنگاری‌شده</Button>}
          {pairing.role === "receiver" && pairing.state === "connected" && <p className="mt-2 text-[10px] text-[var(--text-muted)]">اتصال آماده است؛ منتظر بسته رمزنگاری‌شده دستگاه فرستنده بمان.</p>}
          {pairing.acknowledged && <p className="mt-2 text-[10px] text-[var(--accent-strong)]">✓ دستگاه مقابل دریافت بسته را تأیید کرد.</p>}
        </div>
      )}

      {pairing.preview && pairing.incoming && <DeviceTransferPreviewPanel preview={pairing.preview} sourceName={pairing.incoming.source.deviceName} onApply={pairing.applyIncoming} onCancel={pairing.reset} />}
      <DeviceTransferHistory entries={pairing.history} onClear={pairing.clearHistory} />
      {pairing.error && <p role="alert" className="mt-3 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-[10px] font-semibold text-[var(--danger)]">{pairing.error}</p>}
      {pairing.role !== "idle" && <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={pairing.reset}><RefreshCcw /> پایان نشست و شروع دوباره</Button>}
      <p className="mt-3 text-[9px] leading-6 text-[var(--text-muted)]">برای اتصال بدون سرور Signaling، هر دو دستگاه بهتر است روی یک Wi-Fi باشند. اگر اسکن دوربین در مرورگر موجود نبود، Copy/Paste کد همچنان قابل استفاده است.</p>
    </section>
  );
}
