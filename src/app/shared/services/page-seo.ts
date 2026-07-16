import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/i18n/i18n.service';
import { withLocale } from '../../core/i18n/locale-url';
import { SeoService } from './seo-service';

/** Site-wide link-preview image (1200x630, derived from the hero artwork). */
export const OG_DEFAULT_IMAGE = 'assets/images/og-default.jpg';

/**
 * Applies the full localized SEO head for a page that exists in both locales:
 * title/description from i18n, canonical pointing at the page's OWN locale URL,
 * og:locale, a default og:image, and reciprocal hreflang.
 *
 * Pages call this from ngOnInit. There is no onLangChange subscription to
 * maintain: language is route-driven, so it can no longer change without
 * destroying and recreating the component.
 */
@Injectable({ providedIn: 'root' })
export class PageSeoService {
  private seo = inject(SeoService);
  private translate = inject(TranslateService);
  private i18n = inject(I18nService);

  /**
   * @param ns     i18n namespace, e.g. 'experiencePage'
   * @param pathEn canonical ENGLISH path, e.g. '/experience'
   */
  applyLocalized(ns: string, pathEn: string, opts: { type?: string; image?: string } = {}) {
    const lang = this.i18n.current();
    const base = environment.siteUrl.replace(/\/+$/, '');
    const url = `${base}${withLocale(pathEn, lang)}`;
    const image = `${base}/${opts.image ?? OG_DEFAULT_IMAGE}`;

    // instant() is safe: languageResolver guarantees the JSON is loaded.
    const title = this.translate.instant(`${ns}.seo.metaTitle`) as string;
    const description = this.translate.instant(`${ns}.seo.metaDescription`) as string;

    this.seo.setTitle(title);
    this.seo.setDescription(description);
    this.seo.setRobots();
    this.seo.setCanonical(url);
    this.seo.setOpenGraph({
      title,
      description,
      url,
      image,
      type: opts.type ?? 'website',
      locale: lang === 'hr' ? 'hr_HR' : 'en_US',
    });
    this.seo.setLocaleAlternates(pathEn);
  }

  /** Canonical absolute URL of a page in the current locale. */
  urlFor(pathEn: string): string {
    const base = environment.siteUrl.replace(/\/+$/, '');
    return `${base}${withLocale(pathEn, this.i18n.current())}/`.replace(/\/{2,}$/, '/');
  }

  absolute(assetPath: string): string {
    return `${environment.siteUrl.replace(/\/+$/, '')}/${assetPath.replace(/^\//, '')}`;
  }
}
