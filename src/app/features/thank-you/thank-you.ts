import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { SeoService } from '../../shared/services/seo-service';

/** Where the verbatim vendor snippet lives — see the header comment in that file. */
const TURITOP_SCRIPT_SRC = '/assets/vendor/turitop-thankyou.js';
const GA4_MEASUREMENT_ID = 'G-QN1CZT8HXQ';
const GOOGLE_ADS_TAG_ID = 'AW-11199515913';

type GoogleTagWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

/**
 * The vendor snippet sends the purchase through the global `gtag` function.
 * The site-wide tag normally creates it in index.html, but this page is the
 * revenue-critical fallback: establish the queue here too if another shell,
 * cache, or tag blocker removed the global bridge before the snippet loads.
 */
export function ensureGoogleTagBridge(doc: Document): void {
  const win = doc.defaultView as GoogleTagWindow | null;
  if (!win || typeof win.gtag === 'function') return;

  win.dataLayer = win.dataLayer || [];
  win.gtag = (...args: unknown[]) => win.dataLayer?.push(args);
  win.gtag('js', new Date());
  win.gtag('config', GA4_MEASUREMENT_ID);
  win.gtag('config', GOOGLE_ADS_TAG_ID);
}

/**
 * Booking confirmation page (/dd-thankyou/). TuriTop redirects here after a
 * completed booking, so this page is where conversion tracking fires.
 *
 * Always noindex,nofollow: it must never appear in search results, and it is
 * excluded from sitemap.xml (see scripts/generate-sitemap.mjs).
 */
@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [RouterLink, Header, Footer],
  templateUrl: './thank-you.html',
})
export class ThankYou implements OnInit {
  constructor(
    private seo: SeoService,
    @Inject(DOCUMENT) private doc: Document,
  ) {
    // afterNextRender is browser-only and runs once the view exists, which is
    // exactly what the snippet needs: it never executes during prerender, and
    // fill_tickets() finds the container it writes into already in the DOM.
    afterNextRender(() => this.loadTuritop());
  }

  ngOnInit(): void {
    this.seo.setTitle("Booking confirmed | Diocletian's Dream");
    this.seo.setDescription("Your Diocletian's Dream VR booking is confirmed.");
    this.seo.setRobots(true); // always noindex, nofollow
  }

  private loadTuritop(): void {
    if (!this.hasBooking()) return;

    ensureGoogleTagBridge(this.doc);
    const script = this.doc.createElement('script');
    script.src = TURITOP_SCRIPT_SRC;
    this.doc.body.appendChild(script);
  }

  /**
   * TuriTop always redirects with the booking in the query string. Without it
   * the snippet reports a conversion of `value: null` — a booking that never
   * happened — and then throws in fill_tickets(). So anyone who opens
   * /dd-thankyou/ directly gets the page copy and no tracking.
   */
  private hasBooking(): boolean {
    const params = new URLSearchParams(this.doc.location.search);
    return params.has('booking_id') || params.has('booking_id[]');
  }
}
