import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { commonTestImports, commonTestProviders } from '../testing/test-setup';
import { InteractionTrackingService } from './shared/services/interaction-tracking.service';

describe('App', () => {
  let interactionTracking: jasmine.SpyObj<InteractionTrackingService>;

  beforeEach(async () => {
    interactionTracking = jasmine.createSpyObj<InteractionTrackingService>(
      'InteractionTrackingService',
      ['handleClick'],
    );
    await TestBed.configureTestingModule({
      imports: [App, ...commonTestImports],
      providers: [
        ...commonTestProviders,
        { provide: InteractionTrackingService, useValue: interactionTracking },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the router outlet shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('routes bubbled clicks to analytics without blocking the original action', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const link = document.createElement('a');
    link.dataset['analyticsEvent'] = 'book_now_click';
    link.dataset['analyticsLocation'] = 'homepage_hero';
    fixture.nativeElement.appendChild(link);
    let originalActionRan = false;
    link.addEventListener('click', () => (originalActionRan = true));

    link.click();

    expect(originalActionRan).toBeTrue();
    expect(interactionTracking.handleClick).toHaveBeenCalledTimes(1);
    expect(interactionTracking.handleClick.calls.mostRecent().args[0]).toEqual(
      jasmine.any(MouseEvent),
    );
  });
});
