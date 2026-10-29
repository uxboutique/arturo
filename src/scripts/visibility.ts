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

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top ||
            a.boundingClientRect.left - b.boundingClientRect.left,
        );

      entering.forEach((entry, index) => {
        const el = entry.target as HTMLElement;
        const step = Math.min(index, MAX_STAGGER_STEPS);
        el.style.setProperty('--reveal-delay', `${step * STAGGER_MS}ms`);
        el.classList.add('is-revealed');
        observer.unobserve(el);
        // Drop the delay afterwards so later state changes are not lagged.
        el.addEventListener('transitionend', () => el.style.removeProperty('--reveal-delay'), { once: true });
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );

  targets.forEach((el) => observer.observe(el));
}

export function initOffscreenPause(): void {
  const loops = document.querySelectorAll<HTMLElement>('.today__stage, .channels, .demo');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
    }
  });
  loops.forEach((el) => observer.observe(el));
}
