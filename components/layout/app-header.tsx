"use client";

import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Folder,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Umbrella,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Brand } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { Mode, Tab } from "@/lib/types";

const nav = [
  {
    id: "today" as Tab,
    label: "امروز",
    icon: CalendarDays,
    href: "/today",
  },
  {
    id: "month" as Tab,
    label: "ماه من",
    icon: LayoutDashboard,
    href: "/month",
  },
  {
    id: "clients" as Tab,
    label: "مشتری‌ها",
    icon: Users,
    href: "/clients",
  },
  {
    id: "projects" as Tab,
    label: "پروژه‌ها",
    icon: Folder,
    href: "/projects",
  },
  {
    id: "invoices" as Tab,
    label: "فاکتورها",
    icon: ReceiptText,
    href: "/invoices",
  },
  {
    id: "leave" as Tab,
    label: "مرخصی‌ها",
    icon: Umbrella,
    href: "/leave",
  },
  {
    id: "reports" as Tab,
    label: "گزارش‌ها",
    icon: BarChart3,
    href: "/reports",
  },
];

type AppHeaderProps = {
  name: string;
  mode: Mode;
  pathname?: string;
  onModeChange: (mode: Mode) => void;
  onExport: () => void;
  financialsHidden: boolean;
  onToggleFinancials: () => void;
  saveState: "idle" | "saving" | "saved" | "error";
};

export function AppHeader({
  name,
  mode,
  pathname: propPathname,
  onModeChange,
  onExport,
  financialsHidden,
  onToggleFinancials,
  saveState,
}: AppHeaderProps) {
  const router = useRouter();
  const currentPath = usePathname() || propPathname || "/today";

  const visibleNavItems = nav.filter((item) => {
    if (mode === "employee") {
      return item.id !== "clients" && item.id !== "projects" && item.id !== "invoices";
    }

    if (mode === "freelancer") {
      return item.id !== "month" && item.id !== "leave";
    }

    return true;
  });

  return (
    <header
      className={cn(
        "sticky top-[10px] z-40",
        "grid min-h-[72px] grid-cols-[280px_1fr_330px]",
        "items-center gap-[18px]",
        "rounded-2xl border border-[#dfe7e9]",
        "bg-white/95 px-6",
        "shadow-[0_7px_26px_rgba(30,65,74,0.04)]",
        "backdrop-blur-2xl",

        "max-[1180px]:grid-cols-[220px_1fr_auto]",
        "max-[1180px]:px-[15px]",

        "max-[900px]:static",
        "max-[900px]:grid-cols-[1fr_auto]",
        "max-[900px]:[backdrop-filter:none]",

        "max-[620px]:min-h-16",
        "max-[620px]:rounded-[13px]",
        "max-[620px]:px-[10px]"
      )}
    >
      <Brand
        subtitle={
          name
            ? `فضای شخصی ${name}`
            : "حساب کار، بدون حساب‌وکتاب"
        }
      />

      <nav
        className={cn(
          "flex h-[71px] justify-center gap-5",

          "max-[1180px]:gap-[5px]",

          /*
           * Mobile bottom navigation
           */
          "max-[900px]:fixed",
          "max-[900px]:inset-x-[7px]",
          "max-[900px]:top-auto",
          "max-[900px]:bottom-[calc(7px+env(safe-area-inset-bottom))]",
          "max-[900px]:z-50",
          "max-[900px]:h-16",
          "max-[900px]:justify-around",
          "max-[900px]:rounded-[15px]",
          "max-[900px]:border",
          "max-[900px]:border-[#dfe7e9]",
          "max-[900px]:bg-white/95",
          "max-[900px]:p-1",
          "max-[900px]:shadow-[0_-8px_30px_rgba(17,45,55,0.08)]",
          "max-[900px]:backdrop-blur-xl",

          /*
           * Links/Buttons
           */
          "[&_a]:relative",
          "[&_a]:inline-flex",
          "[&_a]:min-w-[86px]",
          "[&_a]:items-center",
          "[&_a]:justify-center",
          "[&_a]:gap-2",
          "[&_a]:border-0",
          "[&_a]:bg-transparent",
          "[&_a]:font-bold",
          "[&_a]:text-[#102a3a]",
          "[&_a]:transition-colors",
          "[&_a]:duration-200",

          /*
           * Icons
           */
          "[&_a_svg]:h-5",
          "[&_a_svg]:w-5",
          "[&_a_svg]:shrink-0",
          "[&_a_svg]:stroke-[1.8]",

          /*
           * Active state
           */
          "[&_a.active]:text-[#079b60]",

          /*
           * Active indicator
           */
          "[&_a]:after:absolute",
          "[&_a]:after:inset-x-3",
          "[&_a]:after:bottom-0",
          "[&_a]:after:h-[3px]",
          "[&_a]:after:rounded-t-lg",
          "[&_a]:after:bg-transparent",
          "[&_a]:after:content-['']",
          "[&_a]:after:transition-colors",
          "[&_a.active]:after:bg-[#079b60]",

          /*
           * Tablet
           */
          "max-[1180px]:[&_a]:min-w-[72px]",

          /*
           * Mobile buttons
           */
          "max-[900px]:[&_a]:min-w-[55px]",
          "max-[900px]:[&_a]:flex-1",
          "max-[900px]:[&_a]:flex-col",
          "max-[900px]:[&_a]:gap-[3px]",
          "max-[900px]:[&_a]:rounded-xl",
          "max-[900px]:[&_a]:px-1",
          "max-[900px]:[&_a]:py-1",
          "max-[900px]:[&_a]:text-[9px]",
          "max-[900px]:[&_a]:leading-none",

          "max-[900px]:[&_a_svg]:h-[21px]",
          "max-[900px]:[&_a_svg]:w-[21px]",

          "max-[900px]:[&_a]:after:inset-x-3",
          "max-[900px]:[&_a]:after:bottom-[-4px]"
        )}
        aria-label="ناوبری اصلی"
      >
        {visibleNavItems.map(({ label, icon: Icon, href }) => {
          const isActive = currentPath === href;

          return (
            <Link
              key={href}
              href={href}
              className={isActive ? "active" : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "flex items-center justify-end gap-[9px]",

          "max-[900px]:[&>button:last-child]:h-11",
          "max-[900px]:[&>button:last-child]:w-11",
          "max-[900px]:[&>button:last-child]:overflow-hidden",
          "max-[900px]:[&>button:last-child]:px-0",
          "max-[900px]:[&>button:last-child]:text-[0px]",

          "max-[620px]:[&>button:first-of-type]:hidden"
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            "text-xs font-semibold",
            saveState === "error" ? "text-red-600" : "text-[#079b60]",
            "[&_svg]:h-[15px]",
            "[&_svg]:w-[15px]",
            "max-[1180px]:hidden"
          )}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 aria-hidden="true" />
          {saveState === "saving" ? "در حال ذخیره" : saveState === "error" ? "خطای ذخیره" : "ذخیره خودکار"}
        </span>

        <div
          className={cn(
            "grid h-12 grid-cols-[auto_112px]",
            "items-center gap-2",
            "rounded-xl border border-[#cfe2dc]",
            "bg-[#edf9f4]",
            "py-[5px] pl-[10px] pr-[7px]",

            "[&>span]:inline-flex",
            "[&>span]:items-center",
            "[&>span]:gap-[5px]",
            "[&>span]:whitespace-nowrap",
            "[&>span]:text-[10px]",
            "[&>span]:font-bold",
            "[&>span]:text-[#316153]",

            "[&>span_svg]:h-[15px]",
            "[&>span_svg]:w-[15px]",
            "[&>span_svg]:text-[#079b60]",

            "max-[1180px]:grid-cols-[105px]",
            "max-[1180px]:p-[5px]",
            "max-[1180px]:[&>span]:hidden",

            "max-[620px]:w-[104px]",
            "max-[620px]:grid-cols-1"
          )}
        >
          <span>
            <UserRound aria-hidden="true" />
            فضای کاری
          </span>

          <Select
            value={mode}
            onValueChange={(value) => {
              onModeChange(value as Mode);
              // Handle redirection if current page is disallowed for the new mode
              if (value === "employee" && (currentPath === "/clients" || currentPath === "/projects")) {
                router.push("/today");
              } else if (value === "freelancer" && (currentPath === "/month" || currentPath === "/leave")) {
                router.push("/today");
              }
            }}
          >
            <SelectTrigger
              aria-label="تغییر سریع فضای کاری"
              className="h-9 border-[#beddd2] bg-white text-[11px] font-extrabold"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="employee">کارمند</SelectItem>
              <SelectItem value="freelancer">فریلنسر</SelectItem>
              <SelectItem value="hybrid">ترکیبی</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="min-w-11"
          variant="outline"
          size="icon"
          onClick={onToggleFinancials}
          aria-label={financialsHidden ? "نمایش اطلاعات مالی" : "مخفی کردن اطلاعات مالی"}
          title={financialsHidden ? "نمایش اطلاعات مالی" : "مخفی کردن اطلاعات مالی"}
        >
          {financialsHidden ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>

        <Button
          className="min-w-11"
          variant="outline"
          size="icon"
          onClick={onExport}
          aria-label="دانلود پشتیبان"
        >
          <Download aria-hidden="true" />
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push("/settings")}
          className="justify-center"
          aria-label="باز کردن تنظیمات"
        >
          <Settings aria-hidden="true" />
          <span className="hidden lg:block">تنظیمات</span>
        </Button>
      </div>
    </header>
  );
}
