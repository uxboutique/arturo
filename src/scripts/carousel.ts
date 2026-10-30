const MOBILE = '(max-width: 767px)';

export interface CarouselChange {
  index: number;
  /** True when the change comes from the user swiping, not from code. */
  user: boolean;
}

/**
 * Swipe carousels on mobile ([data-carousel], CSS scroll-snap). Adds the
 * position dots and dispatches `carousel:change` (detail: CarouselChange)
 * when the snapped item changes.
 */
export function initCarousels(): void {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((track) => {
    const items = Array.from(track.children) as HTMLElement[];
    if (items.length < 2) return;

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('aria-hidden', 'true');
    dots.append(...items.map(() => document.createElement('i')));
    track.after(dots);

    let current = -1;
    let userScroll = false;
    let frame = 0;

    const nearest = (): number => {
      const start = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).scrollPaddingInlineStart || '0');
      let best = 0;
      let bestDistance = Infinity;
      items.forEach((item, i) => {
        const distance = Math.abs(item.getBoundingClientRect().left - start);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      // At the very end the last card can't reach the start edge.
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) best = items.length - 1;
      return best;
    };

    const update = (): void => {
      frame = 0;
      if (!window.matchMedia(MOBILE).matches) return;
      const index = nearest();
      if (index === current) return;
      current = index;
      Array.from(dots.children).forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      track.dispatchEvent(new CustomEvent<CarouselChange>('carousel:change', { detail: { index, user: userScroll } }));
    };

    // Only scrolls that follow a touch/wheel/key on the track count as "user".
    for (const type of ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const) {
      track.addEventListener(type, () => (userScroll = true), { passive: true });
    }
    track.addEventListener(
      'scroll',
      () => {
        if (!frame) frame = requestAnimationFrame(update);
      },
      { passive: true },
    );
    window.addEventListener('resize', () => {
      if (!frame) frame = requestAnimationFrame(update);
    });
    update();
  });
}

/** Scrolls a carousel so that `item` is at its start edge (no smooth scroll). */
export function scrollToItem(track: HTMLElement, item: HTMLElement): void {
  const padding = parseFloat(getComputedStyle(track).scrollPaddingInlineStart || '0') || 0;
  const delta = item.getBoundingClientRect().left - track.getBoundingClientRect().left - padding;
  track.scrollLeft += delta;
}
