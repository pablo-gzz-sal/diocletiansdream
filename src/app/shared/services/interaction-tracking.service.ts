import { Injectable, inject } from '@angular/core';
import { AnalyticsService } from './analytics.service';

type ClickEventName = 'book_now_click' | 'contact_click' | 'language_switch';
type SupportedLanguage = 'en' | 'hr';

const CLICK_EVENTS = new Set<ClickEventName>([
  'book_now_click',
  'contact_click',
  'language_switch',
]);

/** Converts explicit data attributes into the small, approved GA4 event set. */
@Injectable({ providedIn: 'root' })
export class InteractionTrackingService {
  private readonly analytics = inject(AnalyticsService);

  handleClick(event: Event, explicitTarget?: EventTarget | null): void {
    const origin = explicitTarget ?? event.target;
    if (!(origin instanceof Element)) return;

    const tracked = origin.closest<HTMLElement>('[data-analytics-event]');
    if (!tracked) return;

    const eventName = tracked.dataset['analyticsEvent'];
    if (!this.isClickEvent(eventName)) return;

    const location = tracked.dataset['analyticsLocation'];
    if (!location) return;

    if (eventName === 'book_now_click') {
      this.analytics.track(eventName, { cta_location: location });
      return;
    }

    if (eventName === 'contact_click') {
      const contactMethod = tracked.dataset['contactMethod'];
      if (contactMethod !== 'phone' && contactMethod !== 'email') return;
      this.analytics.track(eventName, {
        cta_location: location,
        contact_method: contactMethod,
      });
      return;
    }

    const fromLanguage = tracked.dataset['fromLanguage'];
    const toLanguage = tracked.dataset['toLanguage'];
    if (!this.isSupportedLanguage(fromLanguage) || !this.isSupportedLanguage(toLanguage)) return;
    if (fromLanguage === toLanguage) return;

    this.analytics.track(eventName, {
      cta_location: location,
      from_language: fromLanguage,
      to_language: toLanguage,
    });
  }

  private isClickEvent(value: string | undefined): value is ClickEventName {
    return typeof value === 'string' && CLICK_EVENTS.has(value as ClickEventName);
  }

  private isSupportedLanguage(value: string | undefined): value is SupportedLanguage {
    return value === 'en' || value === 'hr';
  }
}
