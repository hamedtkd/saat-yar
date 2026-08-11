"use client";

import * as React from "react";
import { ArrowRightLeft, CheckCircle2, Copy, Laptop, Link2, QrCode, RefreshCcw, Send, Share2, Smartphone, Wifi } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
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
  const { locale, s } = useSystemUi();
  const pairing = useDeviceTransferPairing({ data, setData, setToast });
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const connected = pairing.state === "connected" || pairing.state === "received" || pairing.state === "completed";
  const sessionView = getDeviceTransferSessionView(pairing.role, pairing.state, locale);

  const shareLocalLink = async () => {
    if (!pairing.pairingLink) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: s("Saatyar connection"), text: s("This Pairing link is only for this session."), url: pairing.pairingLink });
        return;
      } catch { /* copy fallback */ }
    }
    await copyText(pairing.pairingLink);
    setToast(s("Pairing link was copied."));
  };

  const handleScannedCode = React.useCallback((code: string) => {
    pairing.setRemoteCode(code);
    setScannerOpen(false);
    setToast(s("Connection QR was received; the next step runs automatically."));
    if (pairing.role === "sender") void pairing.acceptAnswer(code);
    else void pairing.startReceiver(code);
  }, [pairing, s, setToast]);

  return (
    <section id="settings-device-transfer" className="scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <PanelHead icon={<ArrowRightLeft />} title={s("Connect phone and laptop")} />
      <p className="mb-3 text-[11px] leading-7 text-[var(--text-muted)]">{s("Connect two devices directly with WebRTC and transfer encrypted AppData without an account or central database.")}</p>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2" data-device-transfer-session-status>
        <span className="text-[10px] font-bold">{s("Session status")}</span>
        <span className="text-[10px] text-[var(--accent-strong)]">{sessionView.label}</span>
      </div>
      <DeviceTransferSteps role={pairing.role} state={pairing.state} />

      {pairing.role === "idle" && (
        <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
          <button type="button" onClick={() => void pairing.startSender()} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-start hover:border-[var(--accent)]">
            <Laptop className="mb-3 size-6 text-[var(--accent-strong)]" /><strong className="block text-sm">{s("Send from this device")}</strong><span className="mt-1 block text-[10px] leading-6 text-[var(--text-muted)]">{s("Use this on the device that has the primary data.")}</span>
          </button>
          <button type="button" onClick={pairing.prepareReceiver} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-start hover:border-[var(--accent)]">
            <Smartphone className="mb-3 size-6 text-[var(--accent-strong)]" /><strong className="block text-sm">{s("Receive on this device")}</strong><span className="mt-1 block text-[10px] leading-6 text-[var(--text-muted)]">{s("Scan the QR or enter the Pairing code.")}</span>
          </button>
        </div>
      )}

      {(pairing.role === "idle" || pairing.role === "receiver") && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2"><label className="block text-[10px] font-bold">{s("Offer / Pairing link")}</label><Button size="sm" variant="outline" onClick={() => setScannerOpen((value) => !value)}><QrCode /> {s("Scan QR")}</Button></div>
          {scannerOpen && <DevicePairingQrScanner onCode={handleScannedCode} onClose={() => setScannerOpen(false)} />}
          <Textarea value={pairing.remoteCode} onChange={(event) => pairing.setRemoteCode(event.target.value)} placeholder={s("saatyar-pair:... or a Saatyar link")} className="mt-2 min-h-24 break-all text-left text-[10px]" dir="ltr" />
          <Button className="mt-2 w-full" disabled={!pairing.remoteCode || pairing.state === "preparing"} onClick={() => void pairing.startReceiver()}><Wifi /> {s("Create answer and connect")}</Button>
        </div>
      )}

      {pairing.localCode && (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-2 flex items-center justify-between gap-2"><strong className="text-xs">{pairing.role === "sender" ? s("This device Offer") : s("This device Answer")}</strong><span className="text-[9px] text-[var(--text-muted)]">{s("Offer valid for 10 minutes")}</span></div>
          <DevicePairingQrDisplay key={pairing.localCode} code={pairing.localCode} />
          <Textarea readOnly value={pairing.localCode} className="mt-3 min-h-20 text-left text-[9px]" dir="ltr" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => void copyText(pairing.localCode).then(() => setToast(s("Pairing code was copied.")))}><Copy /> {s("Copy code")}</Button>
            <Button size="sm" variant="outline" onClick={() => void shareLocalLink()}><Share2 /> {s("Share link")}</Button>
          </div>
          <p className="mt-2 flex items-start gap-2 text-[9px] leading-5 text-[var(--text-muted)]"><Link2 className="mt-0.5 size-3 flex-none" />{s("QR and links are created only on-device. The session code contains the temporary transfer key; do not publish it.")}</p>
        </div>
      )}

      {pairing.role === "sender" && pairing.localCode && !connected && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2"><label className="block text-[10px] font-bold">{s("Other device Answer")}</label><Button size="sm" variant="outline" onClick={() => setScannerOpen((value) => !value)}><QrCode /> {s("Scan QR")}</Button></div>
          {scannerOpen && <DevicePairingQrScanner onCode={handleScannedCode} onClose={() => setScannerOpen(false)} />}
          <Textarea value={pairing.remoteCode} onChange={(event) => pairing.setRemoteCode(event.target.value)} placeholder={s("Scan or paste the Answer here")} className="mt-2 min-h-20 text-left text-[10px]" dir="ltr" />
          <Button className="mt-2 w-full" disabled={!pairing.remoteCode} onClick={() => void pairing.acceptAnswer()}><Wifi /> {s("Complete connection")}</Button>
        </div>
      )}

      {connected && (
        <div className="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] bg-[var(--accent-soft)] p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent-strong)]"><CheckCircle2 className="size-5" /> {pairing.state === "completed" ? s("This transfer session is complete") : s("Direct connection is active")}</div>
          {pairing.role === "sender" && pairing.state !== "completed" && <Button className="mt-3 w-full" onClick={() => void pairing.sendCurrentData()}><Send /> {s("Send encrypted data")}</Button>}
          {pairing.role === "receiver" && pairing.state === "connected" && <p className="mt-2 text-[10px] text-[var(--text-muted)]">{s("Connection is ready; wait for the sender device's encrypted package.")}</p>}
          {pairing.acknowledged && <p className="mt-2 text-[10px] text-[var(--accent-strong)]">✓ {s("The other device acknowledged the package.")}</p>}
        </div>
      )}

      {pairing.preview && pairing.incoming && <DeviceTransferPreviewPanel preview={pairing.preview} sourceName={pairing.incoming.source.deviceName} onApply={pairing.applyIncoming} onCancel={pairing.reset} />}
      <DeviceTransferHistory entries={pairing.history} onClear={pairing.clearHistory} />
      {pairing.error && <p role="alert" className="mt-3 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-[10px] font-semibold text-[var(--danger)]">{pairing.error}</p>}
      {pairing.role !== "idle" && <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={pairing.reset}><RefreshCcw /> {s("End session and start over")}</Button>}
      <p className="mt-3 text-[9px] leading-6 text-[var(--text-muted)]">{s("For serverless signaling, both devices should preferably be on the same Wi-Fi. If camera scanning is unavailable, Copy/Paste still works.")}</p>
    </section>
  );
}
