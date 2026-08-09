# فاز ۱۷۰ — Completed Day Edit Feedback & Save UX

این فاز بازخورد واقعی ویرایش روز تکمیل‌شده را می‌بندد: کاربر ممکن بود پایین رکورد در حال اصلاح ناهار یا وقفه باشد، در حالی که «ذخیره تغییرات / انصراف» فقط بالای صفحه قرار داشت و حالت ویرایش نیز به‌اندازه کافی محسوس نبود.

## قرارداد UX جدید

- با شروع «ویرایش این روز»، کنترل‌های Draft به Action Bar دائماً قابل‌دسترسی منتقل می‌شوند.
- Action Bar وضعیت Draft را صریح نشان می‌دهد: «هنوز تغییری ندادی» یا تعداد تغییرهای ذخیره‌نشده.
- «انصراف»، «بازنشانی» و «ذخیره تغییرات» همیشه نزدیک محل کار کاربر در دسترس‌اند؛ ذخیره تا اولین تغییر غیرفعال است.
- ورودی‌ها در حالت ویرایش accent ظریف می‌گیرند و در حالت locked ظاهر فقط‌خواندنی روشن‌تری دارند تا تفاوت View/Edit قابل تشخیص باشد.
- پس از ذخیره، همان سطح کنترل با تأیید «تغییرات این روز ذخیره شد» جایگزین می‌شود و سپس خودکار محو می‌شود.

## Desktop و Mobile

- در Desktop (`xl` و بالاتر) Action Bar با `position: sticky` زیر Header قرار می‌گیرد و هنگام اسکرول در Editor همان روز قابل مشاهده می‌ماند.
- در viewportهایی که Bottom Navigation فعال است، Action Bar به‌صورت `position: fixed` با فاصله امن بالای Bottom Navigation dock می‌شود. این انتخاب عمدی است: sticky فقط بعد از عبور scroll از موقعیت طبیعی عنصر فعال می‌شود و نمی‌تواند «همیشه داخل viewport» را تضمین کند.
- Editor هنگام ویرایش روی موبایل padding انتهایی اضافه دارد تا آخرین فیلدها پشت Action Bar و Bottom Navigation پنهان نشوند.
- Saved feedback نیز روی موبایل در همان dock نمایش داده می‌شود؛ بنابراین بعد از Save کاربر لازم نیست به محل اولیه Action Bar برگردد.
- Browser Smoke کارمند عمداً Advanced Editor را باز می‌کند، داخل صفحه اسکرول می‌کند، Dirty state را می‌سنجد، Save feedback را تأیید می‌کند و همین مسیر را در viewport موبایل با Cancel تکرار می‌کند.

## اصلاح Revision 2

Gate واقعی Phase 170 نشان داد `position: sticky` روی موبایل به‌تنهایی قرارداد «همیشه قابل مشاهده» را تضمین نمی‌کند: پس از بازشدن Advanced Editor و reflow، Action Bar می‌توانست هنوز پایین‌تر از viewport بماند. Revision 2 به‌جای شل‌کردن Browser Smoke، رفتار محصول را اصلاح می‌کند: Mobile/Tablet dock ثابت بالای Bottom Navigation و Desktop sticky زیر Header.

## ایمنی داده

- مدل Draft تاریخی، Global Unsaved Navigation Guard و `getWorkRecordChanges` تغییر ماهوی نکرده‌اند.
- Save همچنان تنها نقطه‌ای است که Draft را وارد رکورد اصلی می‌کند؛ Cancel داده اصلی را تغییر نمی‌دهد.
- AppData Schema: v17
- Migration: ندارد
- Dependency جدید: ندارد
