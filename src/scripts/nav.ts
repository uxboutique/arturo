const DESKTOP_QUERY = '(min-width: 1024px)';

/** Sticky header: scrolled state, mobile menu and current-section highlight. */
export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const toggleLabel = document.querySelector<HTMLElement>('[data-nav-toggle-label]');
  const panel = document.querySelector<HTMLElement>('[data-nav-panel]');
  if (!nav || !toggle || !panel || !toggleLabel) return;

  // --- Scrolled background. A sentinel at the top of the page avoids a
  // scroll listener entirely.
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    nav.classList.toggle('is-scrolled', !entry?.isIntersecting);
  }).observe(sentinel);

  // --- Mobile menu
  const setOpen = (open: boolean, { restoreFocus = false } = {}): void => {
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
    nav.classList.toggle('is-open', open);
    panel.hidden = !open;
    if (open) {
      panel.querySelector<HTMLElement>('a, button')?.focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a, button')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false, { restoreFocus: true });
    }
  });

  // Close when focus or a click leaves the header.
  document.addEventListener('click', (event) => {
    if (nav.classList.contains('is-open') && !nav.contains(event.target as Node)) setOpen(false);
  });
  nav.addEventListener('focusout', (event) => {
    const next = event.relatedTarget as Node | null;
    if (next && !nav.contains(next) && nav.classList.contains('is-open')) setOpen(false);
  });

  window.matchMedia(DESKTOP_QUERY).addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });

  // --- Highlight the link of the section in view.
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav__links a[href^="#"]'));
  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((section): section is HTMLElement => section !== null);

  const visible = new Set<Element>();
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      const current = sections.find((section) => visible.has(section));
      for (const link of links) {
        if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((section) => spy.observe(section));
}
