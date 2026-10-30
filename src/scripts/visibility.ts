const STAGGER_MS = 110;
const MAX_STAGGER_STEPS = 4;

/**
 * Apple-style scroll reveal for [data-reveal] blocks. Elements that enter
 * the viewport in the same frame (a row of cards) are staggered in reading
 * order. Each element is revealed once.
 */
export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  /*
   * What to watch for each target:
   * - display: contents has no box, so it never intersects: watch its first
   *   child instead (the advisor copy on mobile);
   * - cards inside a swipe carousel can sit off screen sideways, clipped by
   *   the carousel: watch the carousel and reveal all its cards together.
   */
  const groups = new Map<Element, HTMLElement[]>();
  targets.forEach((el) => {
    let watch: Element = el;
    if (el.parentElement?.matches('[data-carousel]')) watch = el.parentElement;
    else if (getComputedStyle(el).display === 'contents' && el.firstElementChild) watch = el.firstElementChild;
    groups.set(watch, [...(groups.get(watch) ?? []), el]);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top ||
            a.boundingClientRect.left - b.boundingClientRect.left,
        )
        .flatMap((entry) => {
          observer.unobserve(entry.target);
          return groups.get(entry.target) ?? [];
        });

      entering.forEach((el, index) => {
        const step = Math.min(index, MAX_STAGGER_STEPS);
        el.style.setProperty('--reveal-delay', `${step * STAGGER_MS}ms`);
        el.classList.add('is-revealed');
        // Drop the delay afterwards so later state changes are not lagged.
        el.addEventListener('transitionend', () => el.style.removeProperty('--reveal-delay'), { once: true });
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );

  groups.forEach((_, watch) => observer.observe(watch));
}

export function initOffscreenPause(): void {
  // Every block except the hero, whose parallax follows the scroll position.
  const loops = document.querySelectorAll<HTMLElement>('main > section:not(.hero), .footer');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
    }
  });
  loops.forEach((el) => observer.observe(el));
}
