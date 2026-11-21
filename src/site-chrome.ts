/** Menus do header — um binder para todas as páginas. */

function closeHeaderMenus(except?: Element | null): void {
  document.querySelectorAll<HTMLElement>('.header-menu[data-open="true"]').forEach((menu) => {
    if (except && (menu === except || menu.contains(except))) return;
    menu.dataset.open = 'false';
    const toggle = menu.parentElement?.querySelector<HTMLElement>('[data-menu-toggle]');
    toggle?.setAttribute('aria-expanded', 'false');
  });
}

export function bindSiteChrome(): void {
  if (document.documentElement.dataset.siteChrome === 'on') return;
  document.documentElement.dataset.siteChrome = 'on';

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (!target) return;

    const toggle = target.closest<HTMLElement>('[data-menu-toggle]');
    if (toggle) {
      const menu = toggle.parentElement?.querySelector<HTMLElement>(':scope > .header-menu');
      if (!menu) return;
      const willOpen = menu.dataset.open !== 'true';
      closeHeaderMenus();
      menu.dataset.open = willOpen ? 'true' : 'false';
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      return;
    }

    if (target.closest('[data-menu-keep]')) return;

    const item = target.closest('.header-menu a, .header-menu button');
    if (item) {
      closeHeaderMenus();
      return;
    }

    if (!target.closest('.menu-anchor') && !target.closest('.popover') && !target.closest('.ds-popover')) {
      closeHeaderMenus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeHeaderMenus();
  });
}

bindSiteChrome();
