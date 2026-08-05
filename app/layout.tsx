import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn/wght.css";
import { SaatyarShell } from "@/components/saatyar-shell";
import { ThemeBootstrap } from "@/components/theme/theme-bootstrap";
import "./globals.css";

export const metadata: Metadata = {
  title: "ساعت‌یار",
  description: "مدیریت شخصی ساعت کاری، پروژه و مرخصی",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className="scroll-smooth">
      <head><ThemeBootstrap /></head>
      <body className="m-0 min-h-screen bg-[var(--page)] font-[Vazirmatn_Variable,Tahoma,sans-serif] font-normal text-[var(--text)] antialiased [font-feature-settings:'ss01'] transition-colors">
        <SaatyarShell>{children}</SaatyarShell>
      </body>
    </html>
  );
}
