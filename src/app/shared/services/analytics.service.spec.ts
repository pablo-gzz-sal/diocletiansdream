import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let originalPath: string;
  let originalLanguage: string;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    originalPath = window.location.pathname;
    originalLanguage = document.documentElement.lang;
  });

  afterEach(() => {
    window.history.replaceState({}, '', originalPath);
    document.documentElement.lang = originalLanguage;
    delete (window as unknown as { gtag?: unknown }).gtag;
    TestBed.resetTestingModule();
  });

  it('sends the event with the current page and Croatian site language', () => {
    const pushed: unknown[][] = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (...args) =>
      pushed.push(args);
    window.history.replaceState({}, '', '/hr/');
    document.documentElement.lang = 'hr';

    TestBed.inject(AnalyticsService).track('book_now_click', {
      cta_location: 'homepage_hero',
    });

    expect(pushed[0]).toEqual([
      'event',
      'book_now_click',
      {
        cta_location: 'homepage_hero',
        page_path: '/hr/',
        site_language: 'hr',
      },
    ]);
  });

  it('uses the URL as a Croatian fallback when the document language is missing', () => {
    const pushed: unknown[][] = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (...args) =>
      pushed.push(args);
    window.history.replaceState({}, '', '/hr/rezervacija/');
    document.documentElement.lang = '';

    TestBed.inject(AnalyticsService).track('booking_widget_view', {
      cta_location: 'booking_widget',
    });

    expect(pushed[0][2]).toEqual(
      jasmine.objectContaining({ page_path: '/hr/rezervacija/', site_language: 'hr' }),
    );
  });

  it('does nothing when the Google tag is unavailable', () => {
    delete (window as unknown as { gtag?: unknown }).gtag;

    expect(() =>
      TestBed.inject(AnalyticsService).track('contact_click', {
        cta_location: 'footer_contact',
        contact_method: 'phone',
      }),
    ).not.toThrow();
  });

  it('does not let a Google tag failure break the visitor action', () => {
    (window as unknown as { gtag: () => never }).gtag = () => {
      throw new Error('blocked');
    };

    expect(() =>
      TestBed.inject(AnalyticsService).track('language_switch', {
        cta_location: 'desktop_header',
        from_language: 'en',
        to_language: 'hr',
      }),
    ).not.toThrow();
  });
});
