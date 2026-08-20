import type { Locale } from "./i18n/locales.ts";

export type LegalSection = { title: string; paragraphs: string[] };
export type LegalPageCopy = { title: string; summary: string; updated: string; sections: LegalSection[] };

const privacyFa: LegalPageCopy = {
  title: "سیاست حریم خصوصی ساعت‌یار",
  summary: "این صفحه توضیح می‌دهد ساعت‌یار چه داده‌هایی را روی دستگاه نگه می‌دارد، Google Calendar چگونه استفاده می‌شود و Cloudflare Web Analytics چه آمار کلی‌ای از بازدید صفحات جمع می‌کند.",
  updated: "آخرین به‌روزرسانی: ۲۹ مرداد ۱۴۰۵ / 20 August 2026",
  sections: [
    { title: "داده‌های اصلی شما", paragraphs: ["ساعت‌یار local-first است. رکوردهای کاری، مرخصی، مشتری‌ها، پروژه‌ها، فاکتورها، حقوق و تنظیمات اصلی در مرورگر شما (IndexedDB) ذخیره می‌شوند و برای استفاده روزمره به حساب ابری ساعت‌یار نیاز ندارند.", "پشتیبان‌گیری یا انتقال دستگاه فقط با اقدام صریح شما انجام می‌شود."] },
    { title: "Google Calendar", paragraphs: ["اتصال Google Calendar کاملاً اختیاری است. ساعت‌یار از مجوز calendar.calendarlist.readonly فقط برای نمایش فهرست تقویم‌های حساب شما و انتخاب تقویم موردنظر استفاده می‌کند.", "مجوز calendar.events فقط برای قابلیت‌های قابل‌مشاهده‌ای استفاده می‌شود که خود کاربر آغاز می‌کند: نمایش و همگام‌سازی رویدادها، ساخت رویداد، ویرایش، حذف، کار با رویدادهای تکرارشونده و تشخیص تداخل. ساعت‌یار عضویت شما در تقویم‌ها را تغییر نمی‌دهد.", "توکن OAuth در حافظه مرورگر نگه‌داری می‌شود و با Disconnect حذف می‌شود. cache همگام‌سازی روی همان دستگاه باقی می‌ماند. داده Google Calendar فروخته نمی‌شود، برای تبلیغات استفاده نمی‌شود و برای آموزش مدل هوش مصنوعی ارسال نمی‌شود."] },
    { title: "آمار کلی بازدید", paragraphs: ["ساعت‌یار در Buildهایی که توکن آن تنظیم شده از Cloudflare Web Analytics برای فهم کلی بازدید صفحات و عملکرد آن‌ها استفاده می‌کند. این integration برای Analytics کوکی یا شناسه‌ای در localStorage، sessionStorage یا IndexedDB ذخیره نمی‌کند و برای ارسال رویدادهای سفارشی محصول استفاده نمی‌شود.", "عملکرد تایمر، مراحل Onboarding، رکوردهای کاری، نام مشتری یا پروژه، یادداشت، حقوق یا درآمد، تاریخ و ساعت کاری، شناسه رکورد، محتوای انتقال دستگاه و AppData به Analytics ارسال نمی‌شوند.", "Cloudflare Web Analytics فقط برای آمار کلی ترافیک و عملکرد صفحه استفاده می‌شود؛ داده‌های اصلی ساعت‌یار همچنان روی دستگاه کاربر باقی می‌مانند."] },
    { title: "اشتراک‌گذاری و نگه‌داری", paragraphs: ["ساعت‌یار داده‌های کاری محلی شما را به فروش نمی‌رساند. سرویس‌های خارجی فقط برای قابلیت مشخص خودشان درگیر می‌شوند؛ مانند Google Calendar یا آمار کلی بازدید Cloudflare.", "برای سؤال درباره حریم خصوصی می‌توانید از راه‌های تماس صفحه درباره استفاده کنید."] },
  ],
};

const privacyEn: LegalPageCopy = {
  title: "Saatyar Privacy Policy",
  summary: "This page explains what Saatyar keeps on your device, how Google Calendar data is used, and what aggregate page-traffic information Cloudflare Web Analytics measures.",
  updated: "Last updated: 20 August 2026",
  sections: [
    { title: "Your core data", paragraphs: ["Saatyar is local-first. Work records, leave, clients, projects, invoices, payroll data, and core settings are stored in your browser (IndexedDB). Everyday use does not require a Saatyar cloud account.", "Backups and device transfer happen only when you explicitly start them."] },
    { title: "Google Calendar", paragraphs: ["Google Calendar connection is optional. Saatyar uses calendar.calendarlist.readonly only to list calendars in your account so you can choose which calendar to use.", "Saatyar uses calendar.events only for visible, user-facing features you initiate: viewing and synchronizing events, creating, editing and deleting events, recurring-event operations, and conflict detection. Saatyar does not change your calendar-list membership.", "The OAuth access token is kept in browser memory and is removed when you disconnect. Calendar sync cache remains on the device. Google Calendar data is not sold, used for advertising, or sent for AI model training."] },
    { title: "Aggregate traffic analytics", paragraphs: ["When configured, Saatyar uses Cloudflare Web Analytics only to understand aggregate page traffic and page performance. The integration does not store analytics cookies or identifiers in localStorage, sessionStorage, or IndexedDB, and Saatyar does not use it to send custom product events.", "Timer actions, onboarding choices, work records, client or project names, notes, salary or income, work dates and exact clock times, record IDs, device-transfer payloads, and AppData are not sent to analytics.", "Cloudflare Web Analytics is used only for aggregate traffic and page-performance measurement; Saatyar's core work data remains on the user's device."] },
    { title: "Sharing and retention", paragraphs: ["Saatyar does not sell your local work data. External services are used only for their specific feature, such as Google Calendar or Cloudflare aggregate traffic analytics.", "For privacy questions, use the contact links on the About page."] },
  ],
};

const termsFa: LegalPageCopy = {
  title: "شرایط استفاده ساعت‌یار",
  summary: "شرایط کلی استفاده از نرم‌افزار متن‌باز ساعت‌یار و قابلیت‌های متصل به سرویس‌های خارجی.",
  updated: "آخرین به‌روزرسانی: ۲۹ مرداد ۱۴۰۵ / 20 August 2026",
  sections: [
    { title: "استفاده از نرم‌افزار", paragraphs: ["ساعت‌یار یک ابزار متن‌باز برای مدیریت زمان، کارکرد و امور کاری شخصی است. شما مسئول بررسی صحت تنظیمات، گزارش‌ها، محاسبات حقوق و خروجی‌هایی هستید که در تصمیم‌های رسمی یا مالی استفاده می‌کنید.", "قابلیت‌ها ممکن است در نسخه‌های بعدی تغییر یا بهبود پیدا کنند."] },
    { title: "داده و پشتیبان", paragraphs: ["از آنجا که داده‌های اصلی local-first هستند، مسئولیت نگه‌داری پشتیبان مناسب از اطلاعات مهم با کاربر است. پاک‌شدن داده مرورگر یا دستگاه می‌تواند باعث از دست‌رفتن اطلاعات محلی شود."] },
    { title: "سرویس‌های خارجی", paragraphs: ["قابلیت‌هایی مانند Google Calendar و Cloudflare Web Analytics تابع شرایط و سیاست‌های سرویس ارائه‌دهنده نیز هستند. Google Calendar فقط بعد از اقدام کاربر متصل می‌شود؛ Cloudflare Web Analytics صرفاً برای آمار کلی بازدید و عملکرد صفحه استفاده می‌شود و ساعت‌یار از آن برای رویدادهای سفارشی کاری استفاده نمی‌کند.", "کاربر می‌تواند Google Calendar را Disconnect کند. داده‌های اصلی ساعت‌یار همچنان Local-first باقی می‌مانند."] },
    { title: "مجوز و مسئولیت", paragraphs: ["کد منبع ساعت‌یار با مجوز MIT منتشر شده است. متن کامل مجوز در مخزن GitHub پروژه موجود است.", "نرم‌افزار بدون تضمین صریح یا ضمنی ارائه می‌شود، تا حدی که قانون قابل‌اعمال اجازه می‌دهد."] },
  ],
};

const termsEn: LegalPageCopy = {
  title: "Saatyar Terms of Service",
  summary: "General terms for using the open-source Saatyar application and its integrations with external services.",
  updated: "Last updated: 20 August 2026",
  sections: [
    { title: "Using the software", paragraphs: ["Saatyar is an open-source productivity tool for work time, attendance, and related personal workflows. You are responsible for reviewing settings, reports, payroll calculations, and exports before relying on them for official or financial decisions.", "Features can change or improve in later releases."] },
    { title: "Data and backups", paragraphs: ["Because core data is local-first, you are responsible for keeping suitable backups of important information. Clearing browser or device storage can remove local data."] },
    { title: "External services", paragraphs: ["External services such as Google Calendar and Cloudflare Web Analytics are also subject to the relevant provider's terms and policies. Google Calendar connects only after a user action; Cloudflare Web Analytics is used only for aggregate page traffic and page-performance measurement, not custom work events.", "You can disconnect Google Calendar. Saatyar's core work data remains local-first."] },
    { title: "License and liability", paragraphs: ["Saatyar source code is distributed under the MIT License. The complete license is available in the project's GitHub repository.", "The software is provided without express or implied warranty to the extent permitted by applicable law."] },
  ],
};

export function getPrivacyCopy(locale: Locale) { return locale === "en" ? privacyEn : privacyFa; }
export function getTermsCopy(locale: Locale) { return locale === "en" ? termsEn : termsFa; }

export function getLegalNavLabels(locale: Locale) {
  return locale === "en"
    ? { about: "About Saatyar", help: "Help", privacy: "Privacy Policy", terms: "Terms of Service", source: "Source code" }
    : { about: "درباره ساعت‌یار", help: "راهنما", privacy: "سیاست حریم خصوصی", terms: "شرایط استفاده", source: "کد منبع" };
}
