import { TestBed } from '@angular/core/testing';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, ConsentService } from './consent.service';

describe('ConsentService', () => {
  let pushed: unknown[][];

  /** ConsentService reads localStorage in its constructor, so each test seeds
   *  storage first and only then asks for the instance. */
  function create(): ConsentService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ConsentService);
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    pushed = [];
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag = (...args: unknown[]) =>
      pushed.push(args);
  });

  afterEach(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it('shows the banner when no decision is stored', () => {
    const service = create();
    expect(service.showBanner()).toBeTrue();
    expect(service.current()).toBeNull();
  });

  it('does not show the banner when a decision is already stored', () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ v: CONSENT_VERSION, analytics: true, marketing: false, ts: 'x' }),
    );
    const service = create();
    expect(service.showBanner()).toBeFalse();
    expect(service.current()?.analytics).toBeTrue();
  });

  it('re-asks when the stored decision predates the current category set', () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ v: CONSENT_VERSION - 1, analytics: true, marketing: true, ts: 'x' }),
    );
    expect(create().showBanner()).toBeTrue();
  });

  it('grants every Consent Mode signal on acceptAll', () => {
    create().acceptAll();
    const update = pushed.find((a) => a[0] === 'consent' && a[1] === 'update');
    expect(update?.[2]).toEqual(
      jasmine.objectContaining({
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      }),
    );
  });

  it('leaves every opt-in signal denied on rejectAll', () => {
    create().rejectAll();
    const update = pushed.find((a) => a[0] === 'consent' && a[1] === 'update');
    expect(update?.[2]).toEqual(
      jasmine.objectContaining({
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      }),
    );
  });

  it('maps a granular choice onto the matching signals only', () => {
    create().save({ analytics: true, marketing: false });
    const update = pushed.find((a) => a[0] === 'consent' && a[1] === 'update');
    expect(update?.[2]).toEqual(
      jasmine.objectContaining({ analytics_storage: 'granted', ad_storage: 'denied' }),
    );
  });

  it('persists the decision so the banner stays dismissed on the next visit', () => {
    create().save({ analytics: false, marketing: true });
    TestBed.resetTestingModule();
    const next = create();
    expect(next.showBanner()).toBeFalse();
    expect(next.current()?.marketing).toBeTrue();
    expect(next.current()?.analytics).toBeFalse();
  });

  it('reopens the banner from the footer entry point', () => {
    const service = create();
    service.acceptAll();
    expect(service.showBanner()).toBeFalse();

    service.reopen();
    expect(service.showBanner()).toBeTrue();
    expect(service.wasReopened()).toBeTrue();
  });

  it('treats unparseable stored consent as undecided', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'not json');
    expect(create().showBanner()).toBeTrue();
  });
});
