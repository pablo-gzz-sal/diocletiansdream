import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Booking } from './booking';
import { commonTestImports, commonTestProviders } from '../../../testing/test-setup';
import { AnalyticsService } from '../../shared/services/analytics.service';

describe('Booking', () => {
  let component: Booking;
  let fixture: ComponentFixture<Booking>;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  let observerCallback: IntersectionObserverCallback;
  let observerOptions: IntersectionObserverInit | undefined;
  let observe: jasmine.Spy;
  let disconnect: jasmine.Spy;
  let originalIntersectionObserver: typeof IntersectionObserver;

  beforeEach(async () => {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    observe = jasmine.createSpy('observe');
    disconnect = jasmine.createSpy('disconnect');
    originalIntersectionObserver = window.IntersectionObserver;

    class FakeIntersectionObserver {
      readonly root = null;
      readonly rootMargin = '0px';
      readonly thresholds = [0.5];

      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        observerCallback = callback;
        observerOptions = options;
      }

      observe = observe;
      disconnect = disconnect;
      unobserve = jasmine.createSpy('unobserve');
      takeRecords = () => [];
    }

    window.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [Booking, ...commonTestImports],
      providers: [
        ...commonTestProviders,
        { provide: AnalyticsService, useValue: analytics },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Booking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    window.IntersectionObserver = originalIntersectionObserver;
    document.querySelectorAll('#js-turitop').forEach((script) => script.remove());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('tracks the booking widget once when half of it becomes visible', () => {
    const widget = fixture.nativeElement.querySelector('#booking-widget') as HTMLElement;

    expect(observerOptions?.threshold).toBe(0.5);
    expect(observe).toHaveBeenCalledOnceWith(widget);

    const entry = {
      isIntersecting: true,
      intersectionRatio: 0.5,
      target: widget,
    } as unknown as IntersectionObserverEntry;
    observerCallback([entry], {} as IntersectionObserver);
    observerCallback([entry], {} as IntersectionObserver);

    expect(analytics.track).toHaveBeenCalledOnceWith('booking_widget_view', {
      cta_location: 'booking_widget',
    });
    expect(disconnect).toHaveBeenCalled();
  });

  it('disconnects widget observation when the booking component is destroyed', () => {
    fixture.destroy();

    expect(disconnect).toHaveBeenCalled();
  });

  it('keeps the existing smooth-scroll booking CTA behaviour', () => {
    const widget = fixture.nativeElement.querySelector('#booking-widget') as HTMLElement;
    const scrollIntoView = jasmine.createSpy('scrollIntoView');
    widget.scrollIntoView = scrollIntoView;
    const event = jasmine.createSpyObj<Event>('Event', ['preventDefault']);

    component.scrollToWidget(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenCalledOnceWith({ behavior: 'smooth', block: 'start' });
  });
});
