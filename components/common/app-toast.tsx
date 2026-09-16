import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "warning" | "danger" | "info";

const toneStyles: Record<ToastTone, { shell: string; icon: string }> = {
  success: {
    shell: "border-[color-mix(in_srgb,var(--success)_34%,var(--border))] bg-[color-mix(in_srgb,var(--success)_9%,var(--surface-1))]",
    icon: "bg-[color-mix(in_srgb,var(--success)_14%,var(--surface-raised))] text-[var(--success)]",
  },
  warning: {
    shell: "border-[color-mix(in_srgb,var(--warning)_38%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface-1))]",
    icon: "bg-[color-mix(in_srgb,var(--warning)_16%,var(--surface-raised))] text-[var(--warning)]",
  },
  danger: {
    shell: "border-[color-mix(in_srgb,var(--danger)_38%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface-1))]",
    icon: "bg-[color-mix(in_srgb,var(--danger)_14%,var(--surface-raised))] text-[var(--danger)]",
  },
  info: {
    shell: "border-[color-mix(in_srgb,var(--info)_34%,var(--border))] bg-[color-mix(in_srgb,var(--info)_8%,var(--surface-1))]",
    icon: "bg-[color-mix(in_srgb,var(--info)_14%,var(--surface-raised))] text-[var(--info)]",
  },
};

const successWords = ["ذخیره شد", "ثبت شد", "ساخته شد", "دانلود شد", "بارگذاری شد", "بازگردانده شد", "فعال شد", "ارسال شد", "قرار گرفت", "ادغام شد", "جایگزین شد", "پاک شد", "حذف شد", "پایان یافت", "saved", "created", "downloaded", "restored", "enabled", "sent", "merged", "replaced", "deleted", "completed", "imported", "ready", "copied", "granted"];
const dangerWords = ["ناموفق", "ممکن نشد", "معتبر نیست", "خطا", "الزامی است", "وارد کنید", "پشتیبانی نمی‌کند", "failed", "invalid", "error", "required", "enter ", "unsupported", "could not", "denied"];
const warningWords = ["ابتدا", "بررسی کنید", "تداخل", "باقی ماند", "متوقف شد", "اجازه داده نشد", "مسدود", "first", "conflict", "remaining", "stopped", "review", "waiting", "blocked"];

export function resolveToastTone(message: string): ToastTone {
  if (dangerWords.some((word) => message.includes(word))) return "danger";
  if (warningWords.some((word) => message.includes(word))) return "warning";
  if (successWords.some((word) => message.includes(word))) return "success";
  return "info";
}

export function AppToast({ message }: { message: string }) {
  const tone = resolveToastTone(message);
  const Icon = tone === "success" ? CheckCircle2 : tone === "warning" ? AlertTriangle : tone === "danger" ? XCircle : Info;

  return (
    <div
      data-app-toast
      data-toast-tone={tone}
      role={tone === "danger" ? "alert" : "status"}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={cn(
        "fixed bottom-4 end-4 z-[1000] flex w-[min(calc(100vw-2rem),420px)] items-start gap-3 rounded-[var(--card-radius)] border px-3.5 py-3 text-start text-xs font-bold text-[var(--text)] sm:bottom-6 sm:end-6 sm:w-[min(calc(100vw-3rem),420px)] sm:px-4",
        "shadow-[var(--surface-shadow)] ring-1 ring-[color-mix(in_srgb,var(--text)_6%,transparent)] backdrop-blur",
        toneStyles[tone].shell,
      )}
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-[var(--control-radius)] shadow-sm", toneStyles[tone].icon)}>
        <Icon aria-hidden="true" className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1 self-center leading-6">{message}</span>
    </div>
  );
}
