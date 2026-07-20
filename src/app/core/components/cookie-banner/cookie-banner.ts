import { Component, afterNextRender, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ConsentService } from '../../../shared/services/consent.service';

/**
 * EU cookie consent banner.
 *
 * Renders nothing during prerender and stays hidden until afterNextRender:
 * whether the banner is due depends on localStorage, which does not exist on
 * the server, so letting it into the prerendered HTML would either bake "show
 * the banner" into every static page or trip a hydration mismatch when the
 * client disagrees. Mounting it after hydration keeps the prerendered DOM and
 * the hydrated DOM identical.
 */
@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.css',
})
export class CookieBanner {
  private consent = inject(ConsentService);

  /** Gate that keeps the banner out of the prerendered/hydrating DOM. */
  protected readonly hydrated = signal(false);

  protected readonly showBanner = this.consent.showBanner;
  protected readonly detailsOpen = signal(false);

  protected readonly analytics = signal(false);
  protected readonly marketing = signal(false);

  constructor() {
    afterNextRender(() => this.hydrated.set(true));

    // Seeding has to happen every time the banner opens, not once at
    // construction: this component lives in the app shell and is never
    // destroyed, so a footer reopen reuses the same instance and a
    // constructor-time (or afterNextRender-time) seed would be long stale.
    effect(() => {
      if (!this.showBanner()) return;

      const stored = this.consent.current();
      this.analytics.set(stored?.analytics ?? false);
      this.marketing.set(stored?.marketing ?? false);

      // Reopening from the footer should land straight on the toggles — the
      // visitor already chose once and is here to change the detail.
      this.detailsOpen.set(this.consent.wasReopened());
    });
  }

  protected acceptAll(): void {
    this.consent.acceptAll();
  }

  protected rejectAll(): void {
    this.consent.rejectAll();
  }

  protected saveChoices(): void {
    this.consent.save({ analytics: this.analytics(), marketing: this.marketing() });
  }

  protected toggleDetails(): void {
    this.detailsOpen.update((v) => !v);
  }
}
