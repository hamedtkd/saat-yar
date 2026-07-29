import { Clock3 } from "lucide-react";
import { tw } from "@/lib/tw";

export function Brand({ subtitle = "حساب کار، بدون حساب‌وکتاب" }: { subtitle?: string }) {
  return (
    <div className={tw("brand")}>
      <span><Clock3 /></span>
      <div><strong>ساعت‌یار</strong><small>{subtitle}</small></div>
    </div>
  );
}
