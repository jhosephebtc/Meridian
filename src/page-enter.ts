/**
 * MERIDIAN — Page enter / loading reveal
 * Veil lifts after first paint; content rises with --ds-enter-scale (never scale(0)).
 */
export function markPageReady(options: { delayMs?: number } = {}): void {
  const delay = options.delayMs ?? 40;
  const reveal = () => {
    window.setTimeout(() => {
      document.documentElement.dataset.pageReady = 'true';
      const veil = document.querySelector<HTMLElement>('.ds-page-veil');
      if (veil) {
        const done = () => veil.setAttribute('aria-hidden', 'true');
        veil.addEventListener('transitionend', done, { once: true });
        window.setTimeout(done, 800);
      }
    }, delay);
  };

  const kick = () => requestAnimationFrame(() => requestAnimationFrame(reveal));

  if (document.readyState !== 'loading') kick();
  else document.addEventListener('DOMContentLoaded', kick, { once: true });
}
