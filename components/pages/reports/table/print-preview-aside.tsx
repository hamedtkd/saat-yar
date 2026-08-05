import { BarChart3, Check, Printer } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";

type Props = { mode: Mode };
export function PrintPreviewAside({ mode }: Props) {
  const isEmployee = mode === "employee";

  const features = isEmployee
    ? [
        "خلاصه حضور و کارکرد",
        "اضافه‌کاری و کسری",
        "جزئیات روزهای کاری",
        "حقوق تخمینی ماه",
      ]
    : [
        "خلاصه زمان و درآمد",
        "نمودارهای تحلیلی",
        "ریز فعالیت‌های پروژه",
        "مناسب چاپ و ذخیره",
      ];

  return (
    <aside
      className={cn(
        "order-last rounded-2xl",
        "border border-[var(--border)]",
        "bg-[var(--surface-glass)] p-4",
        "shadow-[0_10px_35px_rgba(17,45,55,0.055)]",
        "print:hidden",
      )}
    >
      <PanelHead
        icon={<Printer />}
        title={isEmployee ? "گزارش قابل چاپ" : "آماده ارسال به مشتری"}
      />

      <div
        className={cn(
          "mx-auto my-5 grid h-44 w-34",
          "place-items-start justify-center gap-3",
          "rounded-sm border border-[var(--border)]",
          "bg-[var(--surface-1)] p-5",
          "shadow-[0_10px_24px_rgba(17,45,55,0.1)]",
        )}
      >
        <div className="flex w-full items-center justify-between">
          <BarChart3 className="size-8 text-[var(--accent-strong)]" />

          <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[7px] font-bold text-[var(--accent-strong)]">
            PDF
          </span>
        </div>

        <span className="h-1 w-20 rounded-full bg-[var(--border)]" />
        <span className="h-1 w-16 rounded-full bg-[color-mix(in_srgb,var(--border)_65%,transparent)]" />

        <i
          className={cn(
            "h-10 w-20 rounded-md",
            "bg-[linear-gradient(90deg,var(--accent)_28%,var(--border)_28%_39%,var(--chart-secondary)_39%_62%,var(--border)_62%)]",
          )}
        />
      </div>

      <ul className="m-0 list-none p-0">
        {features.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 py-1.5 text-[10px] text-[var(--text-muted)]"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)]">
              <Check className="size-3 text-[var(--accent-strong)]" />
            </span>

            {item}
          </li>
        ))}
      </ul>

      <Button
        type="button"
        className="mt-4 h-11 w-full rounded-xl bg-[var(--accent)] hover:brightness-110"
        onClick={() => window.print()}
      >
        <Printer className="size-4" />
        پیش‌نمایش چاپ
      </Button>
    </aside>
  );
}

