import { LOCALE_STORAGE_KEY } from "@/lib/i18n";

const bootstrap = `(function(){try{var l=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});var e=l==='en';var r=document.documentElement;r.lang=e?'en':'fa';r.dir=e?'ltr':'rtl';r.dataset.locale=e?'en':'fa-IR';}catch(_){}})();`;

export function LocaleBootstrap() {
  return <script dangerouslySetInnerHTML={{ __html: bootstrap }} />;
}
