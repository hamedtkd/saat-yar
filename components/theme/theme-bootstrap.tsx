import { THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeBootstrap() {
  const code = `(function(){try{var a=JSON.parse(localStorage.getItem('${THEME_STORAGE_KEY}')||'null')||{mode:'system',preset:'spotify',accent:'#1ed760',radius:'rounded'};var d=a.mode==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):a.mode;document.documentElement.dataset.theme=d;document.documentElement.dataset.themeMode=a.mode;document.documentElement.dataset.radius=a.radius||'rounded';document.documentElement.style.setProperty('--accent',a.accent||'#1ed760');document.documentElement.style.colorScheme=d}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
