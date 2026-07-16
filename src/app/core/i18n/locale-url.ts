import { DEFAULT_LANG, SupportedLang } from './i18n.config';

/**
 * Paths (English form, no trailing slash except the root) that exist in BOTH
 * locales. Single source of truth for hreflang, the language toggle, and the
 * sitemap.
 *
 * Kept deliberately free of component imports so this module stays pure and
 * cheap to test. `locale-routes.spec.ts` asserts it matches MARKETING_ROUTES,
 * and scripts/generate-sitemap.mjs duplicates it (a build script can't import
 * TypeScript) — update both together.
 *
 * The blog and the legal pages are English-only and must NOT be listed here.
 */
export const TRANSLATED_PATHS: readonly string[] = ['/', '/experience', '/visit', '/about', '/booking'];

const HR_PREFIX = /^\/hr(?=\/|$)/;

/**
 * English path -> Croatian slug. Croatian pages get native URLs
 * (/hr/posjet/, not /hr/visit/) so they read properly to Croatian visitors and
 * carry the keyword people actually search for.
 *
 * The home page has no slug — it is just /hr/.
 *
 * All values are deliberately diacritic-free to avoid percent-encoded URLs.
 * scripts/generate-sitemap.mjs duplicates this map (a build script cannot
 * import TypeScript) — update both together.
 */
const HR_SLUGS: Readonly<Record<string, string>> = {
  '/experience': '/iskustvo',
  '/visit': '/posjet',
  '/about': '/o-nama',
  '/booking': '/rezervacija',
};

const EN_FOR_HR_SLUG: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(HR_SLUGS).map(([en, hr]) => [hr, en]),
);

/** Normalise to the TRANSLATED_PATHS form: no trailing slash, except the root. */
function normalise(path: string): string {
  const p = path.split('?')[0].split('#')[0];
  return p.length > 1 ? p.replace(/\/$/, '') : '/';
}

/**
 * The path *within* a locale, without any /hr prefix — e.g. ('/visit', 'hr')
 * gives '/posjet'. Used to build the Croatian route table.
 */
export function localeSlug(path: string, lang: SupportedLang): string {
  const p = normalise(path.startsWith('/') ? path : `/${path}`);
  if (lang !== 'hr') return p;
  return HR_SLUGS[p] ?? p;
}

/**
 * Split a URL into its locale and its ENGLISH-form path. Everything internal
 * (hreflang, canonicals, TRANSLATED_PATHS, page SEO) speaks English paths; the
 * Croatian slug exists only in the URL.
 */
export function stripLocale(url: string): { lang: SupportedLang; path: string } {
  const path = normalise(url);
  if (!HR_PREFIX.test(path)) return { lang: DEFAULT_LANG, path };
  const slug = path.replace(HR_PREFIX, '') || '/';
  return { lang: 'hr', path: EN_FOR_HR_SLUG[slug] ?? slug };
}

/** Turn an English-form path into a full URL path for the given locale. */
export function withLocale(path: string, lang: SupportedLang): string {
  const p = localeSlug(path, lang);
  if (lang !== 'hr') return p;
  return p === '/' ? '/hr' : `/hr${p}`;
}

/** Does this English-form path have a counterpart in the other locale? */
export function hasCounterpart(path: string): boolean {
  return TRANSLATED_PATHS.includes(normalise(path));
}
