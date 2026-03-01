export const DEFAULT_LANG = 'en';
export const SUPPORTED_LANGS = ['en', 'hr'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const LANG_STORAGE_KEY = 'travane.lang';