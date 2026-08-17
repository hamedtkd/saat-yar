import type { Metadata } from "next";

export const SITE_NAME = "ساعت‌یار";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saat-yar.vercel.app";
export const SITE_DESCRIPTION = "مدیریت فارسی و آفلاین ساعت کاری، حضور، مرخصی، پروژه و گزارش‌های شخصی";
export const SOCIAL_IMAGE_PATH = "/og/saatyar-social-card.png";

export const ROUTE_METADATA = {
  today: {
    title: "امروز",
    description: "ثبت ورود، خروج، ناهار، وقفه و یادداشت روز کاری در ساعت‌یار.",
    path: "/today/",
  },
  month: {
    title: "ماه من",
    description: "نمای ماهانه کارکرد، هدف روزانه و وضعیت روزهای کاری در ساعت‌یار.",
    path: "/month/",
  },
  leave: {
    title: "مرخصی‌ها",
    description: "ثبت و مدیریت مرخصی‌ها، مانده مرخصی و روزهای غیرکاری.",
    path: "/leave/",
  },
  reports: {
    title: "گزارش‌ها",
    description: "گزارش فارسی کارکرد، اضافه‌کاری، درآمد و فعالیت‌های ثبت‌شده.",
    path: "/reports/",
  },
  clients: {
    title: "مشتری‌ها",
    description: "مدیریت مشتری‌ها و دسترسی سریع به پروژه‌ها و زمان‌های قابل‌صورتحساب.",
    path: "/clients/",
  },
  projects: {
    title: "پروژه‌ها",
    description: "مدیریت پروژه‌ها، بودجه، زمان ثبت‌شده و وضعیت مالی پروژه‌ها.",
    path: "/projects/",
  },
  invoices: {
    title: "فاکتورها",
    description: "ایجاد و مدیریت فاکتورهای فارسی بر اساس پروژه و زمان ثبت‌شده.",
    path: "/invoices/",
  },
  settings: {
    title: "تنظیمات",
    description: "تنظیم ظاهر، برنامه کاری، اعلان‌ها، پشتیبان‌گیری و داده‌های ساعت‌یار.",
    path: "/settings/",
  },
} as const;

export const ABOUT_METADATA = {
  title: "درباره و راهنما",
  description: "معرفی ساعت‌یار، قابلیت‌ها، حریم خصوصی، اتصال اختیاری Google Calendar و راه‌های ارتباط با سازنده.",
  path: "/about/",
} as const;


export const HELP_METADATA = {
  title: "راهنمای جامع",
  description: "راهنمای جامع استفاده از ساعت‌یار؛ از راه‌اندازی و ثبت کار تا گزارش، حقوق، پشتیبان، Google Calendar و حریم خصوصی.",
  path: "/help/",
} as const;

export const PRIVACY_METADATA = {
  title: "سیاست حریم خصوصی",
  description: "سیاست حریم خصوصی ساعت‌یار شامل داده‌های local-first، Google Calendar و تحلیل اختیاری محصول.",
  path: "/privacy/",
} as const;

export const TERMS_METADATA = {
  title: "شرایط استفاده",
  description: "شرایط استفاده از ساعت‌یار و قابلیت‌های اختیاری متصل به سرویس‌های خارجی.",
  path: "/terms/",
} as const;

type RouteMetadata = (typeof ROUTE_METADATA)[keyof typeof ROUTE_METADATA] | typeof ABOUT_METADATA | typeof HELP_METADATA | typeof PRIVACY_METADATA | typeof TERMS_METADATA;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL);
}

export function createPageMetadata(page: RouteMetadata): Metadata {
  const fullTitle = `${page.title} | ${SITE_NAME}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: absoluteUrl(page.path) },
    openGraph: {
      title: fullTitle,
      description: page.description,
      url: absoluteUrl(page.path),
      siteName: SITE_NAME,
      locale: "fa_IR",
      type: "website",
      images: [{ url: absoluteUrl(SOCIAL_IMAGE_PATH), width: 1200, height: 630, alt: `پیش‌نمایش ${SITE_NAME}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      images: [absoluteUrl(SOCIAL_IMAGE_PATH)],
    },
  };
}
