import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export type AnalyticsEventName =
  | 'book_now_click'
  | 'booking_widget_view'
  | 'contact_click'
  | 'language_switch';

export type AnalyticsEventParameters = Record<string, string | number | boolean>;

/** Sends focused interaction events through the Google tag already installed by index.html. */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly doc = inject(DOCUMENT);

  track(eventName: AnalyticsEventName, parameters: AnalyticsEventParameters = {}): void {
    if (!this.isBrowser) return;

    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== 'function') return;

    const pagePath = window.location.pathname || '/';
    const documentLanguage = this.doc.documentElement.lang.toLowerCase();
    const siteLanguage =
      documentLanguage.startsWith('hr') || pagePath === '/hr' || pagePath.startsWith('/hr/')
        ? 'hr'
        : 'en';

    try {
      gtag('event', eventName, {
        ...parameters,
        page_path: pagePath,
        site_language: siteLanguage,
      });
    } catch {
      // Analytics must never interfere with the visitor's original action.
    }
  }
}
