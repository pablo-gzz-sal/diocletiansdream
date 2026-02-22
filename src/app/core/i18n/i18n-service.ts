import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'dd_lang';
export type Lang = 'en' | 'hr';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly supported: Lang[] = ['en', 'hr'];

  constructor(private translate: TranslateService) {}

  init() {
    this.translate.addLangs(['en', 'hr']);
    this.translate.setFallbackLang('en'); // instead of setDefaultLang
    // this.translate.use(initialLang);

    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    const browser = this.translate.getBrowserLang() as Lang | undefined;
    const initial =
      saved && this.supported.includes(saved)
        ? saved
        : browser && this.supported.includes(browser)
          ? browser
          : 'en';

    this.use(initial);
  }

  use(lang: Lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    this.translate.use(lang);

    // optional: set <html lang="...">
    document.documentElement.lang = lang;
  }

  current(): Lang {
    return (this.translate.currentLang as Lang) || 'en';
  }
}
