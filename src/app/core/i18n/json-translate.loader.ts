import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class JsonTranslateLoader implements TranslateLoader {
  /** The thank-you page runs the purchase tracking, so it keeps its original loading path. */
  constructor(
    private http: HttpClient,
    private isThankYouPage = false,
  ) {}

  /**
   * Not transferred with the page: the file holds every page's copy, and a page's
   * source may only carry its own. appConfig loads it before the app starts.
   */
  getTranslation(lang: string): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`, {
      transferCache: this.isThankYouPage,
    });
  }
}
