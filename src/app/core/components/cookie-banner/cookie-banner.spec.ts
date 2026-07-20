import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieBanner } from './cookie-banner';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';
import { CONSENT_STORAGE_KEY, ConsentService } from '../../../shared/services/consent.service';

describe('CookieBanner', () => {
  let fixture: ComponentFixture<CookieBanner>;

  beforeEach(async () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    await TestBed.configureTestingModule({
      imports: [CookieBanner, ...commonTestImports],
      providers: [...commonTestProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieBanner);
    fixture.detectChanges();
    // afterNextRender is what un-gates the banner, and it only runs once the
    // application's render hooks flush.
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem(CONSENT_STORAGE_KEY));

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders for an undecided visitor', () => {
    expect(fixture.nativeElement.querySelector('.cookie-banner')).toBeTruthy();
  });

  it('offers reject and accept with equal visual weight', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.cookie-banner__btn:not(.cookie-banner__btn--ghost)'),
    );
    // Same class list means same styling — the guard against an accept-biased
    // banner, which would make the consent invalid.
    expect(buttons.length).toBe(2);
    expect(buttons[0].className).toBe(buttons[1].className);
  });

  it('dismisses itself once a choice is made', () => {
    const reject: HTMLButtonElement = fixture.nativeElement.querySelector('.cookie-banner__btn');
    reject.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cookie-banner')).toBeNull();
    expect(TestBed.inject(ConsentService).current()?.analytics).toBeFalse();
  });

  it('reopens on the toggles, pre-filled from the stored decision', async () => {
    const consent = TestBed.inject(ConsentService);
    consent.save({ analytics: true, marketing: false });
    fixture.detectChanges();

    consent.reopen();
    await fixture.whenStable();
    fixture.detectChanges();

    // The banner lives in the app shell and is never destroyed, so the reopen
    // path has to re-seed a component instance that already rendered once.
    expect(fixture.nativeElement.querySelector('.cookie-banner')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cookie-banner__details')).toBeTruthy();

    const switches: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.cookie-banner__switch'),
    );
    expect(switches.map((s) => s.checked)).toEqual([true, false]);
  });

  it('exposes per-category toggles behind the customise control', () => {
    const ghost: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.cookie-banner__btn--ghost',
    );
    ghost.click();
    fixture.detectChanges();

    const switches = fixture.nativeElement.querySelectorAll('.cookie-banner__switch');
    // Analytics and marketing are togglable; strictly necessary is not offered.
    expect(switches.length).toBe(2);
  });
});
