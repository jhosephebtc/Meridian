/**
 * Meridian Timeline — eixo horizontal arrastável 1:1 + momentum + reveal editorial.
 * CSS: .ds-timeline* em components.css
 */

export interface TimelineItem {
  readonly id?: string;
  /** Rótulo do eixo (hora, ano, marco) */
  readonly label: string;
  readonly title: string;
  readonly description?: string;
  readonly badge?: string;
}

export interface TimelineOptions {
  readonly items: readonly TimelineItem[];
  readonly activeIndex?: number;
  /** Dispara reveal ao montar / ao entrar no viewport (default true) */
  readonly animate?: boolean;
  readonly onSelect?: (index: number, item: TimelineItem) => void;
}

export interface TimelineController {
  readonly root: HTMLElement;
  setItems(items: readonly TimelineItem[], activeIndex?: number): void;
  select(index: number, opts?: { scroll?: boolean; silent?: boolean }): void;
  playReveal(): void;
  scrollBy(dx: number): void;
  getActiveIndex(): number;
  destroy(): void;
}

const FRICTION = 0.92;
const MIN_VELOCITY = 0.25;
const DRAG_THRESHOLD = 5;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function createTimeline(host: HTMLElement, options: TimelineOptions): TimelineController {
  const animate = options.animate !== false;
  let items: TimelineItem[] = [...options.items];
  let activeIndex = clamp(options.activeIndex ?? 0, 0, Math.max(0, items.length - 1));
  let destroyed = false;

  host.classList.add('ds-timeline');
  host.dataset.timeline = 'true';
  if (!host.hasAttribute('role')) host.setAttribute('role', 'group');
  if (!host.getAttribute('aria-label')) host.setAttribute('aria-label', 'Linha do tempo');

  host.innerHTML = `
    <div class="ds-timeline-viewport" tabindex="0">
      <div class="ds-timeline-track">
        <div class="ds-timeline-rail" aria-hidden="true">
          <span class="ds-timeline-rail-progress"></span>
        </div>
      </div>
    </div>
  `;

  const viewport = host.querySelector<HTMLElement>('.ds-timeline-viewport')!;
  const track = host.querySelector<HTMLElement>('.ds-timeline-track')!;
  const progressEl = host.querySelector<HTMLElement>('.ds-timeline-rail-progress')!;

  let drag = {
    active: false,
    moved: false,
    startX: 0,
    startScroll: 0,
    lastX: 0,
    lastT: 0,
    vx: 0,
    raf: 0,
  };

  let revealIo: IntersectionObserver | null = null;

  function updateProgress(): void {
    const nodes = track.querySelectorAll<HTMLElement>('.ds-timeline-node');
    if (!nodes.length) {
      progressEl.style.transform = 'scaleX(0)';
      return;
    }
    const active = nodes[activeIndex] ?? nodes[0]!;
    const trackW = Math.max(1, track.scrollWidth);
    const center = active.offsetLeft + active.offsetWidth * 0.08;
    const pct = clamp(center / trackW, 0, 1);
    progressEl.style.transform = `scaleX(${pct})`;
  }

  function renderNodes(): void {
    const rail = track.querySelector('.ds-timeline-rail');
    track.querySelectorAll('.ds-timeline-node').forEach((n) => n.remove());

    items.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ds-timeline-node';
      btn.dataset.index = String(i);
      btn.style.setProperty('--tl-i', String(i));
      btn.setAttribute('aria-pressed', i === activeIndex ? 'true' : 'false');
      btn.innerHTML = `
        <span class="ds-timeline-label">${item.label}</span>
        <span class="ds-timeline-dot" aria-hidden="true"></span>
        <span class="ds-timeline-title">${item.title}</span>
        ${item.description ? `<span class="ds-timeline-desc">${item.description}</span>` : ''}
      `;
      track.appendChild(btn);
    });

    if (rail) track.prepend(rail);
    updateProgress();
  }

  function select(index: number, opts: { scroll?: boolean; silent?: boolean } = {}): void {
    if (!items.length) return;
    activeIndex = clamp(index, 0, items.length - 1);
    track.querySelectorAll<HTMLElement>('.ds-timeline-node').forEach((n, i) => {
      n.setAttribute('aria-pressed', i === activeIndex ? 'true' : 'false');
      n.dataset.active = i === activeIndex ? 'true' : 'false';
    });
    updateProgress();

    if (opts.scroll !== false) {
      const node = track.querySelector<HTMLElement>(`.ds-timeline-node[data-index="${activeIndex}"]`);
      if (node) {
        const left = node.offsetLeft - viewport.clientWidth * 0.18;
        viewport.scrollTo({
          left: Math.max(0, left),
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
      }
    }

    if (!opts.silent) options.onSelect?.(activeIndex, items[activeIndex]!);
  }

  function playReveal(): void {
    if (prefersReducedMotion() || !animate) {
      host.dataset.revealed = 'true';
      track.querySelectorAll('.ds-timeline-node').forEach((n) => {
        (n as HTMLElement).dataset.revealed = 'true';
      });
      updateProgress();
      return;
    }

    host.dataset.revealed = 'false';
    track.querySelectorAll<HTMLElement>('.ds-timeline-node').forEach((n) => {
      n.dataset.revealed = 'false';
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        host.dataset.revealed = 'true';
        track.querySelectorAll<HTMLElement>('.ds-timeline-node').forEach((n, i) => {
          window.setTimeout(() => {
            if (!destroyed) n.dataset.revealed = 'true';
          }, 60 + i * 70);
        });
        window.setTimeout(() => updateProgress(), 80);
      });
    });
  }

  function setItems(next: readonly TimelineItem[], nextActive?: number): void {
    items = [...next];
    activeIndex = clamp(nextActive ?? activeIndex, 0, Math.max(0, items.length - 1));
    renderNodes();
    select(activeIndex, { scroll: false, silent: true });
    playReveal();
  }

  function scrollBy(dx: number): void {
    viewport.scrollBy({
      left: dx,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  /* ---- Drag 1:1 + momentum ---- */
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    cancelAnimationFrame(drag.raf);
    drag = {
      active: true,
      moved: false,
      startX: e.clientX,
      startScroll: viewport.scrollLeft,
      lastX: e.clientX,
      lastT: performance.now(),
      vx: 0,
      raf: 0,
    };
    viewport.dataset.dragging = 'true';
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) drag.moved = true;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastT);
    drag.vx = (drag.lastX - e.clientX) / dt;
    drag.lastX = e.clientX;
    drag.lastT = now;
    viewport.scrollLeft = drag.startScroll - dx;
  });

  const endDrag = (): void => {
    if (!drag.active) return;
    drag.active = false;
    viewport.dataset.dragging = 'false';
    let v = drag.vx * 16;
    const step = (): void => {
      if (Math.abs(v) < MIN_VELOCITY) return;
      viewport.scrollLeft += v;
      v *= FRICTION;
      drag.raf = requestAnimationFrame(step);
    };
    if (Math.abs(v) > 0.6) drag.raf = requestAnimationFrame(step);
  };

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  viewport.addEventListener('click', (e) => {
    if (drag.moved) return;
    const node = (e.target as HTMLElement).closest<HTMLElement>('.ds-timeline-node');
    if (!node) return;
    select(Number(node.dataset.index));
  });

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      select(activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      select(activeIndex - 1);
    }
  });

  /* ---- Viewport reveal ---- */
  if (animate && typeof IntersectionObserver !== 'undefined') {
    revealIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playReveal();
          revealIo?.disconnect();
          revealIo = null;
        }
      });
    }, { threshold: 0.22, rootMargin: '0px 0px -6% 0px' });
    revealIo.observe(host);
  }

  renderNodes();
  select(activeIndex, { scroll: false, silent: true });
  if (!animate || prefersReducedMotion()) playReveal();

  return {
    root: host,
    setItems,
    select,
    playReveal,
    scrollBy,
    getActiveIndex: () => activeIndex,
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(drag.raf);
      revealIo?.disconnect();
      host.replaceChildren();
    },
  };
}

export function mountTimeline(
  target: string | HTMLElement,
  options: TimelineOptions,
): TimelineController | null {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return null;
  return createTimeline(el, options);
}
