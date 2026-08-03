import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn/wght.css";
import { SaatyarShell } from "@/components/saatyar-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ساعت‌یار",
  description: "مدیریت شخصی ساعت کاری، پروژه و مرخصی",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className="scroll-smooth bg-[#f7faf9]">
      <body className="m-0 min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(5,155,96,.025),transparent_35%),linear-gradient(180deg,#fbfdfc_0%,#f6f9f8_100%)] font-[Vazirmatn_Variable,Tahoma,sans-serif] font-normal text-[#102a3a] antialiased [font-feature-settings:'ss01']">
        <SaatyarShell>{children}</SaatyarShell>
      </body>
    </html>
  );
}
