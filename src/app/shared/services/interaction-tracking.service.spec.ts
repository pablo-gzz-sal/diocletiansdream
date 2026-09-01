import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { InteractionTrackingService } from './interaction-tracking.service';

describe('InteractionTrackingService', () => {
  let analytics: jasmine.SpyObj<AnalyticsService>;
  let service: InteractionTrackingService;

  beforeEach(() => {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    TestBed.configureTestingModule({
      providers: [{ provide: AnalyticsService, useValue: analytics }],
    });
    service = TestBed.inject(InteractionTrackingService);
  });

  function trackedElement(eventName: string, location: string): HTMLAnchorElement {
    const link = document.createElement('a');
    link.dataset['analyticsEvent'] = eventName;
    link.dataset['analyticsLocation'] = location;
    return link;
  }

  it('tracks an annotated contact link when a nested element is clicked', () => {
    const link = trackedElement('contact_click', 'footer_contact');
    link.dataset['contactMethod'] = 'phone';
    const child = document.createElement('span');
    link.appendChild(child);

    service.handleClick(new MouseEvent('click'), child);

    expect(analytics.track).toHaveBeenCalledOnceWith('contact_click', {
      cta_location: 'footer_contact',
      contact_method: 'phone',
    });
  });

  it('tracks a booking CTA using only its stable location', () => {
    const link = trackedElement('book_now_click', 'homepage_hero');

    service.handleClick(new MouseEvent('click'), link);

    expect(analytics.track).toHaveBeenCalledOnceWith('book_now_click', {
      cta_location: 'homepage_hero',
    });
  });

  it('tracks an actual language change with source and destination', () => {
    const button = trackedElement('language_switch', 'mobile_menu');
    button.dataset['fromLanguage'] = 'en';
    button.dataset['toLanguage'] = 'hr';

    service.handleClick(new MouseEvent('click'), button);

    expect(analytics.track).toHaveBeenCalledOnceWith('language_switch', {
      cta_location: 'mobile_menu',
      from_language: 'en',
      to_language: 'hr',
    });
  });

  it('does not track a click on the already-active language', () => {
    const button = trackedElement('language_switch', 'desktop_header');
    button.dataset['fromLanguage'] = 'en';
    button.dataset['toLanguage'] = 'en';

    service.handleClick(new MouseEvent('click'), button);

    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('ignores unannotated controls', () => {
    service.handleClick(new MouseEvent('click'), document.createElement('button'));

    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('ignores event names outside the focused allow-list', () => {
    const link = trackedElement('social_click', 'footer');

    service.handleClick(new MouseEvent('click'), link);

    expect(analytics.track).not.toHaveBeenCalled();
  });
});
