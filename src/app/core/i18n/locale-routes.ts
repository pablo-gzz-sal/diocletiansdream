import { Route, Routes } from '@angular/router';
import { SupportedLang } from './i18n.config';
import { languageResolver } from './language.resolver';
import { localeSlug } from './locale-url';
import { LandingPage } from '../../features/landing-page/landing-page';
import { Experience } from '../../features/experience/experience';
import { Contact } from '../../features/contact/contact';
import { About } from '../../features/about/about';
import { Booking } from '../../features/booking/booking';
import { BlogListPage } from '../../features/blog/blog-list-page/blog-list-page';
import { Privacy } from '../../features/legal/privacy/privacy';
import { Terms } from '../../features/legal/terms/terms';
import { Cookies } from '../../features/legal/cookies/cookies';

/**
 * Pages that exist in BOTH locales. Their paths must match TRANSLATED_PATHS in
 * locale-url.ts (asserted in locale-routes.spec.ts).
 */
export const MARKETING_ROUTES: Routes = [
  { path: '', component: LandingPage },
  { path: 'experience', component: Experience },
  { path: 'visit', component: Contact },
  { path: 'about', component: About },
  { path: 'booking', component: Booking },
];

/**
 * English-only pages. The blog has no Croatian content in WordPress, and the
 * legal pages are hardcoded English with no i18n keys — translating binding
 * legal text is a deliberate non-goal. Croatian pages link here directly.
 */
export const EN_ONLY_ROUTES: Routes = [
  { path: 'blog', component: BlogListPage },
  { path: 'privacy', component: Privacy },
  { path: 'terms', component: Terms },
  { path: 'cookies', component: Cookies },
];

function withLang(lang: SupportedLang) {
  return (route: Route): Route => ({
    ...route,
    data: { ...route.data, lang },
    resolve: { ...route.resolve, lang: languageResolver },
  });
}

/**
 * Stamp `data.lang` + the language resolver onto a set of routes, translating
 * each path into the locale's own slug (/visit -> /posjet under `hr`).
 */
export function localizedRoutes(lang: SupportedLang, extra: Routes = []): Routes {
  return [...MARKETING_ROUTES, ...extra].map((route) => {
    const enPath = route.path ? `/${route.path}` : '/';
    const slug = localeSlug(enPath, lang);
    return withLang(lang)({ ...route, path: slug === '/' ? '' : slug.slice(1) });
  });
}

/** Stamp a single route for a locale (for one-off routes like 404 / :slug). */
export function localizedRoute(route: Route, lang: SupportedLang): Route {
  return withLang(lang)(route);
}
