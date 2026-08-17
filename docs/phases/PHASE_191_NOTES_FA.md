# Phase 191 — Payroll & Reports Hardening

Baseline شروع این فاز روی `dev` برابر `c5f3dc0` است؛ baseline تمیز پس از بسته‌شدن Phase 190.

## هدف

Phase 191 مسیرهای مالی Employee را روی یک **Single Source of Truth** برای ساخت Payroll Facts همگرا می‌کند تا Today، Reports و Payroll Preview از تعریف‌های متفاوت برای اضافه‌کاری، کسری، تعطیل‌کاری و مرخصی استفاده نکنند.

## مشکل‌های Audit شده

دو ناسازگاری مهم در مسیر قبلی وجود داشت:

1. Reports و Payroll Preview جمع کل `balance` ماه را می‌گرفتند و سپس `holidayMinutes` را از overtime کم می‌کردند. در ماهی که هم تعطیل‌کاری و هم کسری وجود داشت، تعطیل‌کاری می‌توانست کسری روزهای عادی را پنهان کند.
2. Today برای مرخصی کامل از `credited` استفاده می‌کرد، اما Payroll ماهانه Reports فقط `worked` واقعی را به engine می‌داد. بنابراین Paid Leave در دو سطح یک contract یکسان نداشت.

## Payroll Period Facts

ماژول `lib/payroll-period.ts` منبع مشترک facts بازه است:

- `actualWorkedMinutes`: کار واقعی ثبت‌شده.
- `creditedMinutes`: اعتبار قابل‌محاسبه برای payroll، شامل مرخصی پرداخت‌شونده در روز عادی.
- `targetMinutes`: هدف واقعی روزهای غیرتعطیل.
- `holidayMinutes`: فقط کار واقعی روی روزی که در WorkRecord تعطیل است.
- `regularBalanceMinutes`: تراز روزهای عادی، بدون آلوده‌شدن به تعطیل‌کاری.
- `overtimeMinutes` و `deficitMinutes`: از تراز خالص روزهای عادی مشتق می‌شوند.

تعطیل‌کاری دیگر نمی‌تواند کسری روز عادی را cancel کند و Google Calendar/Holiday همچنان هیچ ورودی مستقیمی به Payroll ندارد.

## Rate Summary مشترک

نرخ‌های زیر از همان Payroll Policy و همان Rate Basis مشترک مشتق می‌شوند:

- Base hourly rate
- Overtime hourly rate
- Holiday-work hourly rate
- Deficit hourly rate

حالت‌های `multiplier`، `fixed-hourly` و `ignore` بدون فرمول موازی در UI پشتیبانی می‌شوند. Live Payroll Preview اکنون هر چهار نرخ را نمایش می‌دهد.

## رفتار حفظ‌شده

- Released 2.4.0 و Manifestهای تاریخی تغییر نمی‌کنند.
- Development AppData schema همچنان **v20** است.
- dependency جدید اضافه نشده است.
- `standard-month` و `period-target` هر دو حفظ شده‌اند.
- rounding همچنان فقط در Payroll Engine انجام می‌شود.
- recurring payroll components همچنان فقط در محاسبه ماهانه اعمال می‌شوند.
- Today همچنان Base Pay روزانه روش ماهانه را با قرارداد قبلی خود نمایش می‌دهد؛ نرخ premium آن از Policy مشترک می‌آید.

## Behavioral QA

Phase 191 برای موارد زیر تست رفتاری دارد:

- Holiday work + regular deficit در یک بازه.
- Overtime و deficit روزهای عادی و netting بازه.
- Paid full-day leave و consistency با credited time.
- Standard-month holiday/deficit money.
- Custom hourly / fixed overtime / ignored holiday / deficit multiplier.
- استفاده Reports و Payroll Preview از period facts مشترک.

## QA پیشنهادی روی UI

- `/settings/payroll`: Standard Month و Period Target، نرخ Base/Overtime/Holiday/Deficit.
- `/reports`: ماه دارای یک روز تعطیل‌کاری و یک روز کسری؛ هر دو باید همزمان در Payslip دیده شوند.
- یک روز Full Leave باید کسری مصنوعی در Reports نسازد.
- Custom Hourly + Fixed Overtime + Rounding باید در Preview و Reports همان contract را حفظ کند.
- FA/EN، RTL/LTR، Dark/Light، Desktop و Mobile 425px.
