import { prefersReducedMotion } from './config';
import { setLogoState } from './logo';
import type { CarouselChange } from './carousel';

/**
 * "Un consulente ti ascolta. L’agente fa il resto.": each brand-profile item
 * shows its own screen in the phone. Click/tap selects; on mobile the swipe
 * carousel also selects the card it snaps to.
 */
export function initProfile(): void {
  const list = document.querySelector<HTMLElement>('.profile .profile__list');
  const phone = document.querySelector<HTMLElement>('[data-profile-phone]');
  const status = document.querySelector<HTMLElement>('[data-profile-status]');
  if (!list || !phone) return;

  const rows = Array.from(list.querySelectorAll<HTMLButtonElement>('[data-profile]'));
  const panels = new Map(
    Array.from(phone.querySelectorAll<HTMLElement>('[data-panel]')).map((el) => [el.dataset.panel!, el]),
  );
  const askText = phone.querySelector<HTMLElement>('[data-ask-text]');
  const askLogo = phone.querySelector<HTMLElement>('[data-profile-logo]');
  let moodTimer: number | undefined;

  const show = (key: string): void => {
    const panel = panels.get(key);
    if (!panel || !panel.hidden) return;
    for (const [name, el] of panels) {
      el.hidden = name !== key;
      el.classList.remove('is-entering');
    }
    if (!prefersReducedMotion()) {
      void panel.offsetWidth;
      panel.classList.add('is-entering');
    }
    for (const row of rows) row.setAttribute('aria-pressed', String(row.dataset.profile === key));
    phone.setAttribute('aria-label', panel.dataset.label ?? '');
    if (askText) askText.textContent = panel.dataset.ask ?? '';
    if (status) {
      const title = rows.find((r) => r.dataset.profile === key)?.querySelector('.profile__key')?.textContent;
      status.textContent = title ? `Nel telefono: ${title}` : '';
    }
    // Arturo "thinks" for a moment while the screen changes.
    if (askLogo) {
      window.clearTimeout(moodTimer);
      setLogoState(askLogo, 'think');
      moodTimer = window.setTimeout(() => setLogoState(askLogo, 'rest'), 900);
    }
  };

  list.addEventListener('click', (event) => {
    const row = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-profile]');
    if (row) show(row.dataset.profile!);
  });

  list.addEventListener('carousel:change', (event) => {
    const { index, user } = (event as CustomEvent<CarouselChange>).detail;
    if (!user) return;
    const row = rows[index];
    if (row) show(row.dataset.profile!);
  });
}
