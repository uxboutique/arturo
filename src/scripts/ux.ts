import { prefersReducedMotion } from './config';

/**
 * Mobile sticky CTA: shown whenever the hero buttons are off screen (on
 * phones the long hero copy pushes them below the fold), hidden again
 * while the contact form, the closing section or the footer are on screen
 * (their own CTAs are already there).
 */
export function initStickyCta(): void {
  const bar = document.querySelector<HTMLElement>('[data-sticky-cta]');
  const hero = document.querySelector<HTMLElement>('.hero__actions');
  if (!bar || !hero) return;

  const blockers = Array.from(document.querySelectorAll<HTMLElement>('#contatti, .final-cta, .footer'));
  let heroVisible = true;
  const visibleBlockers = new Set<Element>();

  const update = (): void => {
    const show = !heroVisible && visibleBlockers.size === 0;
    bar.classList.toggle('is-visible', show);
    // Out of the tab order while hidden.
    bar.querySelector('a')?.setAttribute('tabindex', show ? '0' : '-1');
    bar.setAttribute('aria-hidden', String(!show));
  };

  new IntersectionObserver(([entry]) => {
    heroVisible = Boolean(entry?.isIntersecting);
    update();
  }).observe(hero);

  const blockerObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleBlockers.add(entry.target);
      else visibleBlockers.delete(entry.target);
    }
    update();
  });
  blockers.forEach((el) => blockerObserver.observe(el));
  update();
}

/** First time a mobile carousel comes into view, nudge it to show it scrolls. */
export function initSwipeHints(): void {
  if (prefersReducedMotion()) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const track = entry.target as HTMLElement;
        observer.unobserve(track);
        if (!window.matchMedia('(max-width: 767px)').matches) continue;
        if (track.scrollWidth <= track.clientWidth + 4) continue;
        track.classList.add('is-hinting');
        track.addEventListener('animationend', () => track.classList.remove('is-hinting'), { once: true });
      }
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((track) => observer.observe(track));
}
