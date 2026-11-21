import { initI18n, getLang, type Lang } from './i18n';
import { applyHomeI18n } from './i18n-home';
import './i18n.css';

function syncHome(lang: Lang = getLang()): void {
  if (!document.getElementById('home-historia-prose')) return;
  applyHomeI18n(lang);
}

window.addEventListener('meridian:lang', ((e: CustomEvent<{ lang: Lang }>) => {
  syncHome(e.detail.lang);
}) as EventListener);

initI18n();
syncHome();
