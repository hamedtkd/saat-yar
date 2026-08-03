import { BarChart3, CalendarDays, Folder, LayoutDashboard, ReceiptText, Umbrella, Users } from "lucide-react";
import type { Mode, Tab } from "@/lib/types";

export const appNavItems = [
  { id: "today" as Tab, label: "امروز", icon: CalendarDays, href: "/today" },
  { id: "month" as Tab, label: "ماه من", icon: LayoutDashboard, href: "/month" },
  { id: "clients" as Tab, label: "مشتری‌ها", icon: Users, href: "/clients" },
  { id: "projects" as Tab, label: "پروژه‌ها", icon: Folder, href: "/projects" },
  { id: "invoices" as Tab, label: "فاکتورها", icon: ReceiptText, href: "/invoices" },
  { id: "leave" as Tab, label: "مرخصی‌ها", icon: Umbrella, href: "/leave" },
  { id: "reports" as Tab, label: "گزارش‌ها", icon: BarChart3, href: "/reports" },
];

export function getVisibleNavItems(mode: Mode) {
  return appNavItems.filter((item) => {
    if (mode === "employee") return !["clients", "projects", "invoices"].includes(item.id);
    if (mode === "freelancer") return !["month", "leave"].includes(item.id);
    return true;
  });
}
