import { CALENDAR_STORAGE_KEY, LOCALE_STORAGE_KEY } from "@/lib/i18n";

const bootstrap = `(function(){try{var l=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});var e=l==='en';var c=localStorage.getItem(${JSON.stringify(CALENDAR_STORAGE_KEY)});var a=c!=='persian'&&c!=='gregory';var k=a?(e?'gregory':'persian'):c;var r=document.documentElement;r.lang=e?'en':'fa';r.dir=e?'ltr':'rtl';r.dataset.locale=e?'en':'fa-IR';r.dataset.calendar=k;}catch(_){}})();`;

export function LocaleBootstrap() {
  return <script dangerouslySetInnerHTML={{ __html: bootstrap }} />;
}
