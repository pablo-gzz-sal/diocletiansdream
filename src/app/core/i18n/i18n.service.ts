import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { DEFAULT_LANG, LANG_STORAGE_KEY, SUPPORTED_LANGS, SupportedLang } from './i18n.config';

/**
 * Language is driven entirely by the URL (`/` = English, `/hr/...` = Croatian)
 * via languageResolver. That is what lets the prerenderer emit real Croatian
 * HTML, and it means the prerendered markup and the hydrated app always agree.
 *
 * There is deliberately no language auto-detection: reading localStorage or
 * navigator.language here would switch the language after hydration and cause a
 * mismatch against the prerendered DOM. localStorage is written as a record of
 * the user's last explicit choice, but is never read back as an input.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly isBrowser: boolean;
  private configured = false;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private doc: Document,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Apply `lang` and return an observable that completes once its JSON has
   * loaded. languageResolver returns this so the router blocks route activation
   * until translations are ready — which is what guarantees `| translate`
   * resolves on the first render pass, the pass the prerenderer serializes.
   */
  activate(lang: SupportedLang): Observable<SupportedLang> {
    if (!this.configured) {
      this.translate.addLangs([...SUPPORTED_LANGS]);
      this.translate.setFallbackLang(DEFAULT_LANG);
      this.configured = true;
    }

    // Runs on the server too: Angular serializes the whole document, so the
    // prerendered file ships <html lang="hr"> statically.
    this.doc.documentElement.lang = lang;
    if (this.isBrowser) {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }

    return this.translate.use(lang).pipe(map(() => lang));
  }

  current(): SupportedLang {
    return (this.translate.getCurrentLang() as SupportedLang) || DEFAULT_LANG;
  }
}
