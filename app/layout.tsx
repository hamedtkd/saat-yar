import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import { PwaRegister } from "./pwa-register";

const repositoryBase = process.env.PAGES_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "ساعت‌یار | محاسبه کارکرد شخصی",
  description: "ثبت ورود، خروج، وقفه، مرخصی و محاسبه کارکرد و حقوق ماهانه",
  other: {
    "codex-preview": "development",
    "saatyar-base": process.env.PAGES_BASE_PATH ?? "",
  },
  icons: {
    icon: `${repositoryBase}/favicon.svg`,
    shortcut: `${repositoryBase}/favicon.svg`,
  },
  manifest: `${repositoryBase}/manifest.webmanifest`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}<PwaRegister /></body>
    </html>
  );
}
