import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "راه‌اندازی اولیه",
  description: "راه‌اندازی اولیه ساعت‌یار برای انتخاب فضای کاری، برنامه کاری و تنظیمات ذخیره‌سازی.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return children;
}
