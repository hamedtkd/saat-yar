export type DeviceTransferSessionRole = "idle" | "sender" | "receiver";
export type DeviceTransferSessionState = "idle" | "preparing" | "waiting" | "connected" | "received" | "completed" | "error";

export type DeviceTransferSessionView = {
  currentStep: number;
  completed: boolean;
  label: string;
};

export function getDeviceTransferSessionView(
  role: DeviceTransferSessionRole,
  state: DeviceTransferSessionState,
): DeviceTransferSessionView {
  if (state === "completed") {
    return { currentStep: 4, completed: true, label: "انتقال این نشست تکمیل شد" };
  }
  if (state === "error") {
    return { currentStep: role === "idle" ? 0 : 1, completed: false, label: "اتصال نیاز به بررسی دارد" };
  }
  if (role === "idle") {
    return { currentStep: 0, completed: false, label: "آماده Pairing" };
  }
  if (state === "preparing") {
    return { currentStep: 1, completed: false, label: "در حال آماده‌سازی اتصال" };
  }
  if (state === "waiting") {
    return { currentStep: 2, completed: false, label: "منتظر برقراری اتصال مستقیم" };
  }
  if (state === "received") {
    return { currentStep: 3, completed: false, label: "داده دریافت شد؛ منتظر تأیید ادغام" };
  }
  if (state === "connected") {
    return {
      currentStep: 3,
      completed: false,
      label: role === "sender" ? "اتصال برقرار است؛ آماده ارسال" : "اتصال برقرار است؛ منتظر دریافت داده",
    };
  }
  return { currentStep: 1, completed: false, label: "آماده ادامه Pairing" };
}
