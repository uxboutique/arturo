import { config } from './config';

/** Footer legal items become links only when a destination is configured. */
export function initLegalLinks(): void {
  const urls: Record<string, string | undefined> = {
    privacy: config.privacyUrl,
    cookie: config.cookieUrl,
  };

  document.querySelectorAll<HTMLElement>('[data-legal-link]').forEach((el) => {
    const href = urls[el.dataset.legalLink ?? ''];
    if (!href) return;
    const link = document.createElement('a');
    link.href = href;
    link.textContent = el.textContent;
    el.replaceWith(link);
  });
}
