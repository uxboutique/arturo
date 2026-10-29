import { prefersReducedMotion } from './config';

const HEADINGS = '.section-title, .advisor__title, .final-cta__title, .faq__title, .logos__title';

/**
 * Wraps each word of the section headings in a span so they can rise in
 * sequence when their block is revealed. Text stays a single readable run
 * for assistive tech (words are plain inline spans separated by spaces).
 */
export function initSplitHeadings(): void {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>(HEADINGS).forEach((heading) => {
    if (heading.dataset.split) return;
    heading.dataset.split = '';
    let index = 0;
    const walk = (node: Node): void => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = (child.textContent ?? '').split(/(\s+)/);
          const fragment = document.createDocumentFragment();
          for (const part of parts) {
            if (part === '') continue;
            if (/^\s+$/.test(part)) {
              fragment.append(part);
            } else {
              const word = document.createElement('span');
              word.className = 'w';
              word.style.setProperty('--wi', String(index++));
              word.textContent = part;
              fragment.append(word);
            }
          }
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      }
    };
    walk(heading);
  });
}

/** Counts [data-count] numbers up from 0 the first time they are seen. */
export function initCounters(): void {
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');
  if (counters.length === 0 || prefersReducedMotion()) return;

  const run = (el: HTMLElement): void => {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.countPrefix ?? '';
    const duration = target > 10 ? 1400 : 900;
    const start = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${prefix}${Math.round(target * eased)}`;
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = `${prefix}0`;
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        // Let the block's own reveal start first.
        window.setTimeout(() => run(entry.target as HTMLElement), 250);
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => observer.observe(el));
}
