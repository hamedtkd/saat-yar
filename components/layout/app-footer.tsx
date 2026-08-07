import { ShieldCheck, Wifi, WifiOff } from "lucide-react";

export function AppFooter({ online }: { online: boolean }) {
  return (
    <footer className="mx-auto flex min-h-12 max-w-[1510px] items-center justify-between gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] px-4 text-[10px] text-[var(--text-muted)] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-2 max-[720px]:py-3 print:hidden">
      <span className="flex items-center gap-2">
        {online ? <Wifi className="size-4 text-[var(--accent-strong)]" /> : <WifiOff className="size-4 text-[var(--warning)]" />}
        {online ? "داده‌ها روی همین دستگاه نگه‌داری می‌شوند" : "آفلاین؛ تغییرات روی همین دستگاه ذخیره می‌شوند"}
      </span>
      <span className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-[var(--accent-strong)]" />
        اطلاعات شخصی به هیچ سروری ارسال نمی‌شود.
      </span>
    </footer>
  );
}
