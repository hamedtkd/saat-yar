import type { Metadata, Viewport } from "next";
import "vazirmatn/Vazirmatn-font-face.css";
import "vazirmatn/misc/Farsi-Digits/Vazirmatn-FD-font-face.css";
import { PwaRegister } from "@/app/pwa-register";
import { CloudflareWebAnalytics } from "@/components/analytics/cloudflare-web-analytics";
import { LocaleBootstrap } from "@/components/i18n/locale-bootstrap";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { LocaleRuntime } from "@/components/i18n/locale-runtime";
import { SaatyarShell } from "@/components/saatyar-shell";
import { ThemeBootstrap } from "@/components/theme/theme-bootstrap";
import { absoluteUrl, PWA_APP_NAME, SITE_DESCRIPTION, SITE_NAME, SOCIAL_IMAGE_PATH } from "@/lib/site-metadata";
import "./globals.css";

const basePath = process.env.PAGES_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: absoluteUrl("/"),
  applicationName: PWA_APP_NAME,
  title: { default: `${SITE_NAME} | مدیریت زمان و کارکرد`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: ["مدیریت زمان", "ثبت ساعت کاری", "کارکرد", "مرخصی", "تایم ترکینگ", "گزارش کار", "پروژه", "ساعت‌یار"],
  category: "productivity",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  alternates: { canonical: absoluteUrl("/") },
  manifest: `${basePath}/manifest.webmanifest`,
  formatDetection: { email: false, address: false, telephone: false },
  appleWebApp: { capable: true, title: PWA_APP_NAME, statusBarStyle: "default" },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${SITE_NAME} | مدیریت زمان و کارکرد`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    locale: "fa_IR",
    type: "website",
    images: [{ url: absoluteUrl(SOCIAL_IMAGE_PATH), width: 1200, height: 630, alt: `پیش‌نمایش ${SITE_NAME}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | مدیریت زمان و کارکرد`,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(SOCIAL_IMAGE_PATH)],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#07171c" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <meta name="saatyar-base" content={basePath} />
        <LocaleBootstrap />
        <meta name="theme-color" content="#8b5cf6" data-saatyar-theme-color />
        <ThemeBootstrap />
      </head>
      <body className="saatyar-app-font m-0 min-h-screen bg-[var(--page)] font-normal text-[var(--text)] antialiased transition-colors">
        <PwaRegister />
        <CloudflareWebAnalytics />
        <LocaleProvider>
          <LocaleRuntime />
          <SaatyarShell>{children}</SaatyarShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
