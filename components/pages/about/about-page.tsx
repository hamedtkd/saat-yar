import {
  BookOpenCheck,
  Github,
  HeartHandshake,
  Linkedin,
  Send,
  ShieldCheck,
  Smartphone,
  TimerReset,
} from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";

const externalLinks = [
  { label: "کد منبع در GitHub", href: "https://github.com/hamedtkd/saat-yar", icon: Github },
  { label: "حمایت مالی اختیاری", href: "https://daramet.com/hamedtkd", icon: HeartHandshake },
  { label: "LinkedIn حامد احمدی", href: "https://www.linkedin.com/in/hamed-ahmadi1/", icon: Linkedin },
  { label: "Telegram @hamed_tkd", href: "https://t.me/hamed_tkd", icon: Send },
] as const;

const guides = [
  { title: "ثبت روز کاری", description: "از «امروز» ورود، خروج، ناهار، وقفه و یادداشت روز را ثبت کن.", icon: TimerReset },
  { title: "برنامه و حقوق", description: "در تنظیمات، روزهای کاری، هدف هفتگی و روش محاسبه حقوق را متناسب با قرارداد خودت بچین.", icon: BookOpenCheck },
  { title: "پشتیبان و انتقال", description: "نسخه JSON بگیر یا با QR و WebRTC داده را مستقیم و رمزنگاری‌شده بین دستگاه‌ها جابه‌جا کن.", icon: Smartphone },
  { title: "حریم خصوصی", description: "داده اصلی روی همین دستگاه می‌ماند؛ ساعت‌یار برای نگه‌داری اطلاعات شخصی به حساب ابری نیاز ندارد.", icon: ShieldCheck },
] as const;

export function AboutPage() {
  return (
    <div className="grid gap-5">
      <PageHeading
        autosave={false}
        title="درباره و راهنمای ساعت‌یار"
        description="راهنمای کوتاه استفاده، حریم خصوصی، کد منبع و راه‌های ارتباط با سازنده."
      />

      <section className="dashboard-card grid gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 sm:p-6">
        <div className="grid max-w-4xl gap-2">
          <strong className="text-lg text-[var(--text)]">ساعت‌یار چیست؟</strong>
          <p className="text-[11px] leading-7 text-[var(--text-muted)]">
            ساعت‌یار یک ابزار فارسی و Local-first برای ثبت ساعت کاری، حضور و مرخصی، پروژه و مشتری، فاکتور، گزارش و محاسبه حقوق است. طراحی برنامه طوری است که کارهای روزمره بدون ساخت حساب کاربری و حتی در حالت آفلاین ادامه پیدا کنند.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {guides.map(({ title, description, icon: Icon }) => (
            <article key={title} className="grid content-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Icon /></span>
              <strong className="text-[12px] text-[var(--text)]">{title}</strong>
              <p className="text-[10px] leading-6 text-[var(--text-muted)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="dashboard-card grid gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 sm:p-6">
          <div className="grid gap-1">
            <strong className="text-sm text-[var(--text)]">شروع سریع</strong>
            <span className="text-[10px] leading-5 text-[var(--text-muted)]">اگر تازه شروع کرده‌ای، این ترتیب ساده‌تر است.</span>
          </div>
          <ol className="grid gap-3 text-[10px] leading-6 text-[var(--text-muted)]">
            <li className="rounded-xl bg-[var(--surface-2)] p-3"><strong className="text-[var(--text)]">۱. تنظیم برنامه کاری:</strong> هدف هفتگی، روزهای فعال، ساعت شروع و پایان و ناهار را در تنظیمات مشخص کن.</li>
            <li className="rounded-xl bg-[var(--surface-2)] p-3"><strong className="text-[var(--text)]">۲. ثبت روز:</strong> صفحه امروز مرکز ثبت ورود، خروج، وقفه و کارهای جاری است.</li>
            <li className="rounded-xl bg-[var(--surface-2)] p-3"><strong className="text-[var(--text)]">۳. مرور نتیجه:</strong> از ماه من و گزارش‌ها برای دیدن کارکرد، تراز ساعت و حقوق استفاده کن.</li>
            <li className="rounded-xl bg-[var(--surface-2)] p-3"><strong className="text-[var(--text)]">۴. پشتیبان:</strong> هرچند وقت یک‌بار فایل پشتیبان بگیر یا انتقال مستقیم بین دستگاه‌ها را انجام بده.</li>
          </ol>
        </div>

        <div className="dashboard-card grid content-start gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 sm:p-6">
          <div className="grid gap-1">
            <strong className="text-sm text-[var(--text)]">لینک‌ها و ارتباط</strong>
            <span className="text-[10px] leading-5 text-[var(--text-muted)]">کد منبع، حمایت اختیاری و راه‌های ارتباط مستقیم.</span>
          </div>
          <div className="grid gap-2">
            {externalLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[10px] font-bold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                <Icon className="text-[var(--accent-strong)]" />
                {label}
              </a>
            ))}
          </div>
          <p className="rounded-xl bg-[var(--accent-soft)] p-3 text-[9px] leading-5 text-[var(--text-muted)]">
            حمایت مالی کاملاً اختیاری است و هیچ قابلیت اضافه‌ای را باز نمی‌کند. گزارش باگ و پیشنهاد فنی را می‌توانی در GitHub ثبت کنی؛ برای ارتباط مستقیم هم LinkedIn و Telegram در دسترس‌اند.
          </p>
        </div>
      </section>
    </div>
  );
}
