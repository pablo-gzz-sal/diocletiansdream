import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANG, LANG_STORAGE_KEY, SUPPORTED_LANGS, SupportedLang } from './i18n.config';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly isBrowser: boolean;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private doc: Document,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  init() {
    this.translate.addLangs([...SUPPORTED_LANGS]);
    this.translate.setDefaultLang(DEFAULT_LANG);

    // On the server there is no localStorage/navigator, so fall back to the
    // default language. The browser re-runs init() during hydration and
    // switches to the user's preferred language if it differs.
    const stored = this.isBrowser
      ? (localStorage.getItem(LANG_STORAGE_KEY) as SupportedLang | null)
      : null;
    const browser = this.isBrowser
      ? (this.translate.getBrowserLang() as SupportedLang | undefined)
      : undefined;

    const initial =
      (stored && this.isSupported(stored) && stored) ||
      (browser && this.isSupported(browser) && browser) ||
      DEFAULT_LANG;

    this.use(initial);
  }

  use(lang: SupportedLang) {
    this.translate.use(lang);
    if (this.isBrowser) {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
    this.doc.documentElement.lang = lang;
  }

  current(): SupportedLang {
    return (this.translate.currentLang as SupportedLang) || DEFAULT_LANG;
  }

  toggle() {
    this.use(this.current() === 'en' ? 'hr' : 'en');
  }

  private isSupported(lang: string): lang is SupportedLang {
    return (SUPPORTED_LANGS as readonly string[]).includes(lang);
  }
}