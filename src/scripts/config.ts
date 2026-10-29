/** Runtime configuration read from Vite env vars (see .env.example). */
const env = import.meta.env;

const clean = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const config = {
  contactEndpoint: clean(env.VITE_CONTACT_ENDPOINT),
  contactEmail: clean(env.VITE_CONTACT_EMAIL),
  privacyUrl: clean(env.VITE_PRIVACY_URL),
  cookieUrl: clean(env.VITE_COOKIE_URL),
} as const;

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
