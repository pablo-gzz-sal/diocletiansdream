import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { I18nService } from './i18n.service';
import { DEFAULT_LANG, SupportedLang } from './i18n.config';

/**
 * Blocks route activation until the route's language JSON has loaded, so
 * components render translated text on their first pass. Reads `data.lang`,
 * which localizedRoutes() stamps onto every leaf route.
 */
export const languageResolver: ResolveFn<SupportedLang> = (route: ActivatedRouteSnapshot) => {
  const lang = (route.data['lang'] as SupportedLang) ?? DEFAULT_LANG;
  return inject(I18nService).activate(lang);
};
