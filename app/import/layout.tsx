import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "واردسازی داده‌ها",
  description: "واردسازی امن فایل پشتیبان و CSV در ساعت‌یار با Preview و مدیریت تعارض‌ها.",
  robots: { index: false, follow: false },
};

export default function ImportLayout({ children }: { children: ReactNode }) {
  return children;
}
