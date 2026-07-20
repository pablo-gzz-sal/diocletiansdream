import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const CONSENT_STORAGE_KEY = 'dd.cookie-consent';

/** Bump when the categories change, so stored consent is re-asked rather than misread. */
export const CONSENT_VERSION = 1;

export interface ConsentDecision {
  v: number;
  /** Google Analytics 4. */
  analytics: boolean;
  /** Google Ads — remarketing and conversion attribution. */
  marketing: boolean;
  /** ISO timestamp, kept as the record of when consent was given. */
  ts: string;
}

type ConsentState = 'granted' | 'denied';

/**
 * Owns the visitor's cookie decision and mirrors it into Google Consent Mode v2.
 *
 * The denied-by-default state is established by the inline snippet in
 * index.html — it has to be, because gtag.js loads long before Angular
 * bootstraps and a default set from here would arrive too late to stop the
 * first pageview from writing cookies. This service handles everything after
 * that: reading back the stored decision, recording new ones, and pushing
 * gtag('consent','update') so tags start or stop writing cookies without a
 * page reload.
 *
 * Strictly necessary cookies (session, security, the visitor's own cookie
 * choice) are not represented here — they are not opt-in and are never gated.
 */
@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** null = the visitor has not answered yet, so the banner is due. */
  private readonly decision = signal<ConsentDecision | null>(null);

  /** Set when the visitor reopens preferences from the footer after deciding. */
  private readonly reopened = signal(false);

  readonly current = this.decision.asReadonly();

  /**
   * Banner visibility. Undecided visitors see it; decided ones only see it
   * again if they ask for it from the footer link.
   */
  readonly showBanner = signal(false);

  constructor() {
    if (!this.isBrowser) return;
    const stored = this.read();
    this.decision.set(stored);
    this.showBanner.set(stored === null);
    if (stored) this.push(stored);
  }

  acceptAll(): void {
    this.save({ analytics: true, marketing: true });
  }

  rejectAll(): void {
    this.save({ analytics: false, marketing: false });
  }

  save(choice: { analytics: boolean; marketing: boolean }): void {
    const decision: ConsentDecision = {
      v: CONSENT_VERSION,
      analytics: choice.analytics,
      marketing: choice.marketing,
      ts: new Date().toISOString(),
    };

    this.decision.set(decision);
    this.reopened.set(false);
    this.showBanner.set(false);

    if (!this.isBrowser) return;
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(decision));
    } catch {
      // Private mode or blocked storage: the decision still applies for this
      // page view, it just cannot be remembered. Better than failing the click.
    }
    this.push(decision);
  }

  /** Footer "Cookie settings" entry point — lets a visitor change their mind. */
  reopen(): void {
    this.reopened.set(true);
    this.showBanner.set(true);
  }

  /** True when the banner was opened deliberately rather than by being undecided. */
  wasReopened(): boolean {
    return this.reopened();
  }

  private read(): ConsentDecision | null {
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<ConsentDecision>;
      // A decision from an older category set is not a decision about the
      // current one, so treat it as unanswered and ask again.
      if (parsed?.v !== CONSENT_VERSION) return null;
      return {
        v: CONSENT_VERSION,
        analytics: parsed.analytics === true,
        marketing: parsed.marketing === true,
        ts: typeof parsed.ts === 'string' ? parsed.ts : new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Mirror the decision into Consent Mode. gtag is defined by the inline
   * snippet, so it exists even while gtag.js is still downloading — the call
   * queues on dataLayer and is honoured once the tag runs. If an ad blocker
   * removed the snippet entirely there is nothing to update, and nothing to do.
   */
  private push(decision: ConsentDecision): void {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== 'function') return;

    const ads: ConsentState = decision.marketing ? 'granted' : 'denied';
    const analytics: ConsentState = decision.analytics ? 'granted' : 'denied';

    gtag('consent', 'update', {
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads,
      analytics_storage: analytics,
      functionality_storage: 'granted',
      personalization_storage: analytics,
    });
  }
}
