import { ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { tw } from "@/lib/tw";

export function AppFooter({ online }: { online: boolean }) {
  return (
    <footer className={tw("app-footer")}>
      <span>{online ? <><Wifi /> برنامه آماده استفاده آفلاین است</> : <><WifiOff /> آفلاین؛ همه تغییرات روی همین دستگاه ذخیره می‌شوند</>}</span>
      <span><ShieldCheck /> اطلاعات شخصی به هیچ سروری ارسال نمی‌شود.</span>
    </footer>
  );
}
