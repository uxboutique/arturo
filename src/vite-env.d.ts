/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_ENDPOINT?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_PRIVACY_URL?: string;
  readonly VITE_COOKIE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
