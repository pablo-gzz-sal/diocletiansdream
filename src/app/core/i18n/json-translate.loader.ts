import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { from, map, Observable } from 'rxjs';

export class JsonTranslateLoader implements TranslateLoader {
  /** `overHttp` keeps the thank-you page, which runs the purchase tracking, on its original path. */
  constructor(
    private http: HttpClient,
    private overHttp = false,
  ) {}

  /**
   * Lazy chunks, not the JSON files: the host caches .json for 6 months whatever
   * .htaccess says, while chunk names change with their content. They also stay
   * out of the page source, which may only carry that page's own content.
   */
  getTranslation(lang: string): Observable<Record<string, any>> {
    if (this.overHttp) return this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`);

    const translations =
      lang === 'hr' ? import('../../../assets/i18n/hr.json') : import('../../../assets/i18n/en.json');
    return from(translations).pipe(map((file) => file.default));
  }
}
