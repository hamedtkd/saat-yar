import { ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/cn";
export function AppFooter({ online }: { online: boolean }) {
  return (
    <footer
      className={cn(
        "mx-auto flex min-h-12 max-w-377.5 items-center justify-between gap-5 rounded-xl border border-[#dfe7e9] bg-white/80 px-4 text-[9px] text-[#6c7d89] [&_span]:flex [&_span]:items-center [&_span]:gap-1.5 [&_svg]:w-[15px] [&_svg]:text-[#079b60] max-[900px]:mb-[76px] max-[620px]:flex-col max-[620px]:items-start max-[620px]:py-[10px] print:hidden",
      )}
    >
      <span>
        {online ? (
          <>
            <Wifi /> برنامه آماده استفاده آفلاین است
          </>
        ) : (
          <>
            <WifiOff /> آفلاین؛ همه تغییرات روی همین دستگاه ذخیره می‌شوند
          </>
        )}
      </span>
      <span>
        <ShieldCheck /> اطلاعات شخصی به هیچ سروری ارسال نمی‌شود.
      </span>
    </footer>
  );
}
