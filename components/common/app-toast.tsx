import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "warning" | "danger" | "info";

const toneStyles: Record<ToastTone, { shell: string; icon: string }> = {
  success: {
    shell: "border-[color-mix(in_srgb,var(--success)_34%,var(--border))] bg-[color-mix(in_srgb,var(--success)_9%,var(--surface-1))]",
    icon: "bg-[var(--success)] text-white",
  },
  warning: {
    shell: "border-[color-mix(in_srgb,var(--warning)_38%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface-1))]",
    icon: "bg-[var(--warning)] text-white",
  },
  danger: {
    shell: "border-[color-mix(in_srgb,var(--danger)_38%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface-1))]",
    icon: "bg-[var(--danger)] text-white",
  },
  info: {
    shell: "border-[color-mix(in_srgb,var(--info)_34%,var(--border))] bg-[color-mix(in_srgb,var(--info)_8%,var(--surface-1))]",
    icon: "bg-[var(--info)] text-white",
  },
};

const successWords = ["ذخیره شد", "ثبت شد", "ساخته شد", "دانلود شد", "بارگذاری شد", "بازگردانده شد", "فعال شد", "ارسال شد", "قرار گرفت", "ادغام شد", "جایگزین شد", "پاک شد", "حذف شد", "پایان یافت"];
const dangerWords = ["ناموفق", "ممکن نشد", "معتبر نیست", "خطا", "الزامی است", "وارد کنید", "پشتیبانی نمی‌کند"];
const warningWords = ["ابتدا", "بررسی کنید", "تداخل", "باقی ماند", "متوقف شد", "اجازه داده نشد", "مسدود"];

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
        "fixed left-1/2 top-4 z-[1000] flex w-[min(92vw,520px)] -translate-x-1/2 items-start gap-3 rounded-2xl border px-3.5 py-3 text-right text-xs font-bold text-[var(--text)]",
        "shadow-[0_18px_55px_rgba(0,0,0,.28)] ring-1 ring-black/5 sm:top-5 sm:px-4",
        toneStyles[tone].shell,
      )}
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl shadow-sm", toneStyles[tone].icon)}>
        <Icon aria-hidden="true" className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1 self-center leading-6">{message}</span>
    </div>
  );
}
