"use client";

import { BarChart3, BriefcaseBusiness, CalendarDays, CheckCircle2, Download, Folder, LayoutDashboard, Settings, Umbrella, UserRound, Users } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tw } from "@/lib/tw";
import type { Mode, Tab } from "@/lib/types";
import { cn } from "@/lib/utils";

const nav = [
  { id: "today" as Tab, label: "امروز", icon: CalendarDays },
  { id: "month" as Tab, label: "ماه من", icon: LayoutDashboard },
  { id: "clients" as Tab, label: "مشتری‌ها", icon: Users },
  { id: "projects" as Tab, label: "پروژه‌ها", icon: Folder },
  { id: "leave" as Tab, label: "مرخصی‌ها", icon: Umbrella },
  { id: "reports" as Tab, label: "گزارش‌ها", icon: BarChart3 },
];

export function AppHeader({ name, mode, tab, onTabChange, onModeChange, onExport }: {
  name: string;
  mode: Mode;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  onModeChange: (mode: Mode) => void;
  onExport: () => void;
}) {
  const visible = nav.filter((item) => {
    if (mode === "employee") return item.id !== "clients" && item.id !== "projects";
    if (mode === "freelancer") return item.id !== "month" && item.id !== "leave";
    return true;
  });

  return (
    <header className={tw("topbar")}>
      <Brand subtitle={name ? `فضای شخصی ${name}` : "حساب کار، بدون حساب‌وکتاب"} />
      <nav
        className={cn(tw("main-nav"),"inset-y-0! top-20!")}
        aria-label="ناوبری اصلی"
        // style={{
        //   top: "auto",
        //   bottom: "calc(7px + env(safe-area-inset-bottom))",
        // }}
      >
        {visible.map(({ id, label, icon: Icon }) => (
          <button type="button" key={id} className={tab === id ? "active" : ""} onClick={() => onTabChange(id)}>
            <Icon /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className={tw("top-actions")}>
        <span className={tw("autosave")}><CheckCircle2 /> ذخیره خودکار</span>
        <div className={tw("quick-mode-switch")}>
          <span><UserRound /> فضای کاری</span>
          <Select value={mode} onValueChange={(value) => onModeChange(value as Mode)}>
            <SelectTrigger aria-label="تغییر سریع فضای کاری" className="h-9 border-[#beddd2] bg-white text-[11px] font-extrabold"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="employee">کارمند</SelectItem><SelectItem value="freelancer">فریلنسر</SelectItem><SelectItem value="hybrid">ترکیبی</SelectItem></SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={onExport} aria-label="دانلود پشتیبان"><Download /></Button>
        <Button variant="outline" onClick={() => onTabChange("settings")}><Settings /> تنظیمات</Button>
      </div>
    </header>
  );
}