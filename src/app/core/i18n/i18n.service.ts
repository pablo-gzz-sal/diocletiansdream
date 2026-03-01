import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANG, LANG_STORAGE_KEY, SUPPORTED_LANGS, SupportedLang } from './i18n.config';

@Injectable({ providedIn: 'root' })
export class I18nService {
  constructor(private translate: TranslateService) {}

  init() {
    this.translate.addLangs([...SUPPORTED_LANGS]);
    this.translate.setDefaultLang(DEFAULT_LANG);
    this.translate.use('hr');

    const stored = (localStorage.getItem(LANG_STORAGE_KEY) as SupportedLang | null);
    const browser = (this.translate.getBrowserLang() as SupportedLang | undefined);

    const initial =
      (stored && this.isSupported(stored) && stored) ||
      (browser && this.isSupported(browser) && browser) ||
      DEFAULT_LANG;

    this.use(initial);
  }

  use(lang: SupportedLang) {
    this.translate.use(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
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