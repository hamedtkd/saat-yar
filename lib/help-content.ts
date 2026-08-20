import type { Locale } from "./i18n/locales.ts";

export type HelpItem = { title: string; body: string; href?: string; action?: string };
export type HelpSection = { title: string; intro: string; items: HelpItem[] };
export type HelpCopy = { title: string; summary: string; sections: HelpSection[]; note: string };

const fa: HelpCopy = {
  title: "راهنمای جامع ساعت‌یار",
  summary: "از راه‌اندازی اولیه و ثبت روز کاری تا گزارش، حقوق، Google Calendar، پشتیبان‌گیری و حریم خصوصی؛ مسیرهای اصلی ساعت‌یار در یک صفحه.",
  note: "داده‌های اصلی ساعت‌یار Local-first هستند. قبل از تغییر مرورگر یا دستگاه، یک پشتیبان JSON تازه بگیر.",
  sections: [
    { title: "شروع و تنظیمات پایه", intro: "اگر تازه شروع کرده‌ای، اول پایه‌های محیط کاری را مشخص کن.", items: [
      { title: "راه‌اندازی اولیه", body: "در onboarding نام، نوع محیط کاری، برنامه هفتگی، حقوق، ظاهر و انتخاب حریم خصوصی را تنظیم کن.", href: "/onboarding", action: "باز کردن راه‌اندازی" },
      { title: "پروفایل و زبان", body: "نام نمایشی، فارسی/English و تنظیمات شخصی را از بخش پروفایل تغییر بده.", href: "/settings/profile", action: "تنظیمات پروفایل" },
      { title: "برنامه کاری", body: "روزهای فعال، هدف هفتگی، ساعت شروع و پایان، ناهار و حالت انعطاف‌پذیر را تنظیم کن.", href: "/settings/work", action: "تنظیم برنامه کاری" },
    ]},
    { title: "ثبت کار روزانه", intro: "صفحه امروز مرکز ثبت حضور و فعالیت جاری است.", items: [
      { title: "کارمند", body: "ورود و خروج، ناهار، وقفه، ویرایش روز تکمیل‌شده و یادداشت روز را از Today مدیریت کن.", href: "/today", action: "رفتن به امروز" },
      { title: "فریلنسر", body: "تایمر پروژه، ثبت زمان دستی، فعالیت‌ها و ارتباط زمان با مشتری و پروژه از همین جریان انجام می‌شود.", href: "/today", action: "ثبت زمان" },
      { title: "روزهای قبل", body: "از انتخاب تاریخ برای مرور یا اصلاح روزهای قبلی استفاده کن؛ تغییرات ذخیره‌نشده قبل از جابه‌جایی محافظت می‌شوند." },
    ]},
    { title: "ماه، مرخصی و گزارش", intro: "برای مرور نتیجه و تصمیم‌گیری، از نمای ماه و گزارش‌ها استفاده کن.", items: [
      { title: "تقویم کاری", body: "تقویم ماهانه، heatmap فعالیت، کارکرد هفتگی، اضافه‌کاری/کسری و زمینه Google Calendar را کنار هم ببین.", href: "/month", action: "باز کردن تقویم" },
      { title: "مرخصی", body: "مرخصی کامل یا نیم‌روز، مانده و روزهای غیرکاری را ثبت و مرور کن.", href: "/leave", action: "مدیریت مرخصی" },
      { title: "گزارش و حقوق", body: "گزارش کارکرد، تراز ساعت، خلاصه حقوق و خروجی‌های قابل استفاده را بررسی کن.", href: "/reports", action: "دیدن گزارش‌ها" },
    ]},
    { title: "مشتری، پروژه و فاکتور", intro: "در حالت فریلنسر یا Hybrid، جریان تجاری به زمان‌های ثبت‌شده متصل است.", items: [
      { title: "مشتری‌ها", body: "مشتری بساز و پروژه‌های مرتبط را از همان جریان ایجاد یا مدیریت کن.", href: "/clients", action: "مشتری‌ها" },
      { title: "پروژه‌ها", body: "نرخ، بودجه، زمان، هزینه و وضعیت پروژه را مدیریت کن.", href: "/projects", action: "پروژه‌ها" },
      { title: "فاکتورها", body: "فاکتور را بر اساس مشتری و پروژه ایجاد کن و وضعیت مالی آن را نگه دار.", href: "/invoices", action: "فاکتورها" },
    ]},
    { title: "پشتیبان، انتقال و آفلاین", intro: "مالکیت داده با توست؛ برای دوام اطلاعات، پشتیبان منظم مهم است.", items: [
      { title: "پشتیبان JSON", body: "از Settings/Data فایل پشتیبان بگیر و قبل از اعمال فایل ورودی، Preview و conflictها را بررسی کن.", href: "/settings/data", action: "تنظیمات داده" },
      { title: "انتقال دستگاه", body: "با QR و WebRTC داده رمزنگاری‌شده را مستقیم بین دو دستگاه منتقل کن؛ merge و replace قبل از اعمال قابل بررسی‌اند.", href: "/settings/sync", action: "انتقال و همگام‌سازی" },
      { title: "PWA و آفلاین", body: "ساعت‌یار را نصب کن. داده محلی و shell اصلی بعد از نصب برای استفاده آفلاین در دسترس می‌مانند." },
    ]},
    { title: "Google Calendar و حریم خصوصی", intro: "سرویس‌های خارجی کاملاً اختیاری‌اند و فقط با اقدام یا رضایت تو فعال می‌شوند.", items: [
      { title: "Google Calendar", body: "تقویم دلخواه را وصل کن، رویدادها را ببین و در صورت نیاز بساز، ویرایش یا حذف کن. Disconnect توکن حافظه و cache اتصال را پاک می‌کند.", href: "/settings/integrations", action: "اتصال‌ها" },
      { title: "آمار محصول", body: "GA4 فقط بعد از opt-in فعال می‌شود و taxonomy آن محتوای کاری، نام‌ها، مبلغ‌ها، متن آزاد، شناسه‌ها و زمان دقیق را ارسال نمی‌کند.", href: "/settings/privacy", action: "تنظیمات حریم خصوصی" },
      { title: "سیاست‌ها", body: "جزئیات استفاده از داده و سرویس‌های خارجی در سیاست حریم خصوصی و شرایط استفاده آمده است.", href: "/privacy", action: "سیاست حریم خصوصی" },
    ]},
  ],
};

const en: HelpCopy = {
  title: "Complete Saatyar Guide",
  summary: "A single guide covering setup, daily work, reports, payroll, Google Calendar, backups, privacy, and the main Saatyar workflows.",
  note: "Saatyar core data is local-first. Create a fresh JSON backup before changing browser or device.",
  sections: [
    { title: "Setup and essentials", intro: "Start by defining the basics of your workspace.", items: [
      { title: "Initial setup", body: "Use onboarding to set your name, workspace mode, weekly schedule, payroll, appearance, and privacy choice.", href: "/onboarding", action: "Open onboarding" },
      { title: "Profile and language", body: "Change your display name, Persian/English language, and personal preferences from Profile settings.", href: "/settings/profile", action: "Profile settings" },
      { title: "Work schedule", body: "Configure active days, weekly target, start/end time, lunch, and flexible-work behavior.", href: "/settings/work", action: "Work settings" },
    ]},
    { title: "Daily work", intro: "Today is the center of attendance and active work tracking.", items: [
      { title: "Employee workflow", body: "Manage clock-in/out, lunch, breaks, completed-day editing, and the daily note from Today.", href: "/today", action: "Go to Today" },
      { title: "Freelancer workflow", body: "Run project timers, add manual time, track activities, and connect time to clients and projects.", href: "/today", action: "Track time" },
      { title: "Previous days", body: "Use date navigation to review or correct earlier days. Unsaved changes are guarded before navigation." },
    ]},
    { title: "Work Calendar, leave, and reports", intro: "Use Work Calendar and Reports to review outcomes rather than just raw entries.", items: [
      { title: "Work Calendar", body: "Review the monthly work calendar, activity heatmap, weekly work, overtime/deficit, and Google Calendar context.", href: "/month", action: "Open Work Calendar" },
      { title: "Leave", body: "Record full or half-day leave and review entitlement and non-working days.", href: "/leave", action: "Manage leave" },
      { title: "Reports and payroll", body: "Review work totals, time balance, payroll summaries, and available exports.", href: "/reports", action: "Open Reports" },
    ]},
    { title: "Clients, projects, and invoices", intro: "Freelancer and Hybrid workspaces connect business records to tracked time.", items: [
      { title: "Clients", body: "Create clients and add related projects without leaving the workflow.", href: "/clients", action: "Clients" },
      { title: "Projects", body: "Manage rates, budgets, tracked time, expenses, and project status.", href: "/projects", action: "Projects" },
      { title: "Invoices", body: "Create invoices linked to clients and projects and keep their financial status organized.", href: "/invoices", action: "Invoices" },
    ]},
    { title: "Backup, transfer, and offline use", intro: "You own the data; regular backups are the durability layer.", items: [
      { title: "JSON backup", body: "Export from Settings/Data. Imports show a preview and conflicts before anything is applied.", href: "/settings/data", action: "Data settings" },
      { title: "Device transfer", body: "Use QR and WebRTC for encrypted direct transfer. Review merge or replace outcomes before applying them.", href: "/settings/sync", action: "Transfer and sync" },
      { title: "PWA and offline", body: "Install Saatyar as an app. Local data and the installed shell remain available for offline workflows." },
    ]},
    { title: "Google Calendar and privacy", intro: "External services are optional and activate only after your action or consent.", items: [
      { title: "Google Calendar", body: "Connect a calendar to view events and, when needed, create, edit, or delete them. Disconnect clears the in-memory token and local connection cache.", href: "/settings/integrations", action: "Integrations" },
      { title: "Product analytics", body: "GA4 loads only after opt-in. The analytics taxonomy excludes work content, names, money amounts, free text, IDs, and exact times.", href: "/settings/privacy", action: "Privacy settings" },
      { title: "Policies", body: "Read the Privacy Policy and Terms for details about local data and optional external services.", href: "/privacy", action: "Privacy Policy" },
    ]},
  ],
};

export function getHelpCopy(locale: Locale) { return locale === "en" ? en : fa; }
