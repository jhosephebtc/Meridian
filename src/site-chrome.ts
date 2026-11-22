/** Menus do header — um binder para todas as páginas. */

function closeHeaderMenus(except?: Element | null): void {
  document.querySelectorAll<HTMLElement>('.header-menu[data-open="true"]').forEach((menu) => {
    if (except && (menu === except || menu.contains(except))) return;
    menu.dataset.open = 'false';
    const toggle = menu.parentElement?.querySelector<HTMLElement>('[data-menu-toggle]');
    toggle?.setAttribute('aria-expanded', 'false');
  });
}

const GH_STARS_CACHE_KEY = 'meridian-gh-stars-v1';
const GH_STARS_TTL_MS = 15 * 60 * 1000;

function formatStarCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function applyStarBadges(slots: NodeListOf<HTMLElement>, count: number): void {
  const text = formatStarCount(count);
  slots.forEach((el) => {
    el.textContent = text;
    el.hidden = false;
  });
}

function hydrateGitHubStars(): void {
  const slots = document.querySelectorAll<HTMLElement>('[data-gh-stars]');
  if (!slots.length) return;

  try {
    const raw = sessionStorage.getItem(GH_STARS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { count?: unknown; ts?: unknown };
      if (
        typeof parsed.count === 'number'
        && typeof parsed.ts === 'number'
        && Date.now() - parsed.ts < GH_STARS_TTL_MS
      ) {
        applyStarBadges(slots, parsed.count);
        return;
      }
    }
  } catch {
    /* ignore cache read failures */
  }

  fetch('https://api.github.com/repos/jhosephebtc/Meridian', {
    headers: { Accept: 'application/vnd.github+json' },
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { stargazers_count?: unknown } | null) => {
      if (!data || typeof data.stargazers_count !== 'number') return;
      applyStarBadges(slots, data.stargazers_count);
      try {
        sessionStorage.setItem(
          GH_STARS_CACHE_KEY,
          JSON.stringify({ count: data.stargazers_count, ts: Date.now() }),
        );
      } catch {
        /* ignore quota errors */
      }
    })
    .catch(() => {
      /* offline or rate-limited — keep hidden silently */
    });
}

export function bindSiteChrome(): void {
  if (document.documentElement.dataset.siteChrome === 'on') return;
  document.documentElement.dataset.siteChrome = 'on';

  try {
    const savedSurface = localStorage.getItem('meridian-surface');
    if (savedSurface) {
      document.documentElement.setAttribute('data-surface', savedSurface);
      document.querySelectorAll<HTMLElement>('[data-chroma]').forEach((btn) => {
        btn.setAttribute('aria-pressed', btn.dataset.chroma === savedSurface ? 'true' : 'false');
      });
    }
  } catch {
    /* ignore storage errors */
  }

  hydrateGitHubStars();

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (!target) return;

    const chromaBtn = target.closest<HTMLElement>('[data-chroma]');
    if (chromaBtn?.dataset.chroma) {
      try {
        localStorage.setItem('meridian-surface', chromaBtn.dataset.chroma);
      } catch {
        /* ignore storage errors */
      }
    }
    const surfaceBtn = target.closest<HTMLElement>('[data-set-surface]');
    if (surfaceBtn?.dataset.setSurface) {
      try {
        localStorage.setItem('meridian-surface', surfaceBtn.dataset.setSurface);
      } catch {
        /* ignore storage errors */
      }
    }

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
