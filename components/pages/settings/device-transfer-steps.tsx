import { Check } from "lucide-react";
import {
  getDeviceTransferSessionView,
  type DeviceTransferSessionRole,
  type DeviceTransferSessionState,
} from "@/lib/device-transfer-session-ui";

const baseSteps = ["انتخاب مسیر", "تبادل QR", "اتصال مستقیم"];

export function DeviceTransferSteps({ role, state }: {
  role: DeviceTransferSessionRole;
  state: DeviceTransferSessionState;
}) {
  const view = getDeviceTransferSessionView(role, state);
  const finalLabel = role === "receiver" ? "بررسی و ادغام" : "ارسال و تأیید";
  const steps = [...baseSteps, finalLabel];

  return (
    <ol className="mb-4 grid grid-cols-4 gap-2 max-[620px]:grid-cols-2" aria-label="مراحل انتقال دستگاه" data-device-transfer-steps>
      {steps.map((label, index) => {
        const done = view.completed || index < view.currentStep;
        const active = !view.completed && index === view.currentStep;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className={`rounded-xl border px-2.5 py-2 text-center text-[9px] font-bold transition ${
              done
                ? "border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : active
                  ? "border-[var(--accent)] bg-[var(--surface-1)] text-[var(--text)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"
            }`}
          >
            <span className="mb-1 inline-flex size-5 items-center justify-center rounded-full border border-current text-[9px]">
              {done ? <Check className="size-3" /> : (index + 1).toLocaleString("fa-IR")}
            </span>
            <span className="block">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
