import type { Locale } from "./i18n/locales.ts";

export type LegalSection = { title: string; paragraphs: string[] };
export type LegalPageCopy = { title: string; summary: string; updated: string; sections: LegalSection[] };

const privacyFa: LegalPageCopy = {
  title: "سیاست حریم خصوصی ساعت‌یار",
  summary: "این صفحه توضیح می‌دهد ساعت‌یار چه داده‌هایی را روی دستگاه نگه می‌دارد، Google Calendar چگونه استفاده می‌شود و تحلیل اختیاری محصول چه زمانی فعال می‌شود.",
  updated: "آخرین به‌روزرسانی: ۲۶ مرداد ۱۴۰۵ / 17 August 2026",
  sections: [
    { title: "داده‌های اصلی شما", paragraphs: ["ساعت‌یار local-first است. رکوردهای کاری، مرخصی، مشتری‌ها، پروژه‌ها، فاکتورها، حقوق و تنظیمات اصلی در مرورگر شما (IndexedDB) ذخیره می‌شوند و برای استفاده روزمره به حساب ابری ساعت‌یار نیاز ندارند.", "پشتیبان‌گیری یا انتقال دستگاه فقط با اقدام صریح شما انجام می‌شود."] },
    { title: "Google Calendar", paragraphs: ["اتصال Google Calendar کاملاً اختیاری است. ساعت‌یار از مجوز calendar.calendarlist.readonly فقط برای نمایش فهرست تقویم‌های حساب شما و انتخاب تقویم موردنظر استفاده می‌کند.", "مجوز calendar.events فقط برای قابلیت‌های قابل‌مشاهده‌ای استفاده می‌شود که خود کاربر آغاز می‌کند: نمایش و همگام‌سازی رویدادها، ساخت رویداد، ویرایش، حذف، کار با رویدادهای تکرارشونده و تشخیص تداخل. ساعت‌یار عضویت شما در تقویم‌ها را تغییر نمی‌دهد.", "توکن OAuth در حافظه مرورگر نگه‌داری می‌شود و با Disconnect حذف می‌شود. cache همگام‌سازی روی همان دستگاه باقی می‌ماند. داده Google Calendar فروخته نمی‌شود، برای تبلیغات استفاده نمی‌شود و برای آموزش مدل هوش مصنوعی ارسال نمی‌شود."] },
    { title: "تحلیل اختیاری محصول", paragraphs: ["تحلیل محصول فقط بعد از رضایت صریح شما فعال می‌شود. در نسخه‌های پشتیبانی‌شده، Saatyar می‌تواند رویدادهای کلی مانند بازدید یک بخش، تکمیل onboarding، شروع/پایان کار یا استفاده از یک قابلیت را به Google Analytics 4 ارسال کند.", "نام، یادداشت، عنوان مشتری یا پروژه، مبلغ حقوق یا درآمد، متن آزاد، شناسه رکورد، تاریخ کاری و ساعت دقیق در taxonomy تحلیل محصول ارسال نمی‌شوند. تبلیغات و personalization برای این integration غیرفعال می‌شوند.", "می‌توانید هر زمان از Settings تحلیل را خاموش کنید؛ قبل از opt-in هیچ Google Analytics tag توسط ساعت‌یار بارگذاری نمی‌شود."] },
    { title: "اشتراک‌گذاری و نگه‌داری", paragraphs: ["ساعت‌یار داده‌های کاری محلی شما را به فروش نمی‌رساند. سرویس‌های خارجی فقط وقتی درگیر می‌شوند که خودتان قابلیت مربوط را فعال کنید، مانند Google Calendar یا تحلیل اختیاری محصول.", "برای سؤال درباره حریم خصوصی می‌توانید از راه‌های تماس صفحه درباره استفاده کنید."] },
  ],
};

const privacyEn: LegalPageCopy = {
  title: "Saatyar Privacy Policy",
  summary: "This page explains what Saatyar keeps on your device, how Google Calendar data is used, and when optional product analytics is enabled.",
  updated: "Last updated: 17 August 2026",
  sections: [
    { title: "Your core data", paragraphs: ["Saatyar is local-first. Work records, leave, clients, projects, invoices, payroll data, and core settings are stored in your browser (IndexedDB). Everyday use does not require a Saatyar cloud account.", "Backups and device transfer happen only when you explicitly start them."] },
    { title: "Google Calendar", paragraphs: ["Google Calendar connection is optional. Saatyar uses calendar.calendarlist.readonly only to list calendars in your account so you can choose which calendar to use.", "Saatyar uses calendar.events only for visible, user-facing features you initiate: viewing and synchronizing events, creating, editing and deleting events, recurring-event operations, and conflict detection. Saatyar does not change your calendar-list membership.", "The OAuth access token is kept in browser memory and is removed when you disconnect. Calendar sync cache remains on the device. Google Calendar data is not sold, used for advertising, or sent for AI model training."] },
    { title: "Optional product analytics", paragraphs: ["Product analytics is enabled only after your explicit opt-in. Supported builds can send coarse events such as route views, onboarding completion, work start/finish, or feature use to Google Analytics 4.", "Saatyar's analytics taxonomy excludes names, notes, client/project titles, salary or income amounts, free text, record IDs, work dates, and exact clock times. Advertising signals and ad personalization are disabled for this integration.", "You can turn analytics off again from Settings. Before opt-in, Saatyar does not load the Google Analytics tag."] },
    { title: "Sharing and retention", paragraphs: ["Saatyar does not sell your local work data. External services are involved only when you choose to enable the related feature, such as Google Calendar or optional analytics.", "For privacy questions, use the contact links on the About page."] },
  ],
};

const termsFa: LegalPageCopy = {
  title: "شرایط استفاده ساعت‌یار",
  summary: "شرایط کلی استفاده از نرم‌افزار متن‌باز ساعت‌یار و قابلیت‌های اختیاری متصل به سرویس‌های خارجی.",
  updated: "آخرین به‌روزرسانی: ۲۶ مرداد ۱۴۰۵ / 17 August 2026",
  sections: [
    { title: "استفاده از نرم‌افزار", paragraphs: ["ساعت‌یار یک ابزار متن‌باز برای مدیریت زمان، کارکرد و امور کاری شخصی است. شما مسئول بررسی صحت تنظیمات، گزارش‌ها، محاسبات حقوق و خروجی‌هایی هستید که در تصمیم‌های رسمی یا مالی استفاده می‌کنید.", "قابلیت‌ها ممکن است در نسخه‌های بعدی تغییر یا بهبود پیدا کنند."] },
    { title: "داده و پشتیبان", paragraphs: ["از آنجا که داده‌های اصلی local-first هستند، مسئولیت نگه‌داری پشتیبان مناسب از اطلاعات مهم با کاربر است. پاک‌شدن داده مرورگر یا دستگاه می‌تواند باعث از دست‌رفتن اطلاعات محلی شود."] },
    { title: "سرویس‌های خارجی", paragraphs: ["قابلیت‌هایی مانند Google Calendar و Google Analytics تابع شرایط و سیاست‌های سرویس ارائه‌دهنده نیز هستند. اتصال آن‌ها اختیاری است و فقط بعد از اقدام یا رضایت کاربر فعال می‌شود.", "کاربر می‌تواند Google Calendar را Disconnect کند و تحلیل اختیاری محصول را از Settings خاموش کند."] },
    { title: "مجوز و مسئولیت", paragraphs: ["کد منبع ساعت‌یار با مجوز MIT منتشر شده است. متن کامل مجوز در مخزن GitHub پروژه موجود است.", "نرم‌افزار بدون تضمین صریح یا ضمنی ارائه می‌شود، تا حدی که قانون قابل‌اعمال اجازه می‌دهد."] },
  ],
};

const termsEn: LegalPageCopy = {
  title: "Saatyar Terms of Service",
  summary: "General terms for using the open-source Saatyar application and its optional integrations with external services.",
  updated: "Last updated: 17 August 2026",
  sections: [
    { title: "Using the software", paragraphs: ["Saatyar is an open-source productivity tool for work time, attendance, and related personal workflows. You are responsible for reviewing settings, reports, payroll calculations, and exports before relying on them for official or financial decisions.", "Features can change or improve in later releases."] },
    { title: "Data and backups", paragraphs: ["Because core data is local-first, you are responsible for keeping suitable backups of important information. Clearing browser or device storage can remove local data."] },
    { title: "External services", paragraphs: ["Optional features such as Google Calendar and Google Analytics are also subject to the relevant provider's terms and policies. These integrations are enabled only after a user action or explicit consent.", "You can disconnect Google Calendar and turn optional product analytics off in Settings."] },
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
