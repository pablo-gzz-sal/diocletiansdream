# Conversion Interaction Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send four focused, privacy-safe interaction groups to the site's existing GA4 Google tag while preserving every current navigation and TuriTop purchase behaviour.

**Architecture:** A browser-safe `AnalyticsService` owns the direct `gtag('event', ...)` call and automatically adds page/language context. `InteractionTrackingService` reads explicit `data-analytics-*` annotations from bubbled clicks handled by the root component, so only agreed controls are tracked. The Booking component uses an isolated `IntersectionObserver` to send one `booking_widget_view` without touching the TuriTop iframe.

**Tech Stack:** Angular 20 standalone components, TypeScript 5.9, Jasmine/Karma, Node test runner, existing gtag.js/GA4 consent-mode installation, Angular static production build.

---

## File Structure

- Create `src/app/shared/services/analytics.service.ts`: safe direct GA4 event delivery and shared event types.
- Create `src/app/shared/services/analytics.service.spec.ts`: browser, context, unavailable-tag, and failure tests.
- Create `src/app/shared/services/interaction-tracking.service.ts`: allow-listed parsing of explicitly annotated clicks.
- Create `src/app/shared/services/interaction-tracking.service.spec.ts`: click parsing and no-op behaviour tests.
- Modify `src/app/app.ts`: route bubbled root clicks to the interaction tracker.
- Modify `src/app/app.spec.ts`: prove annotated controls track without blocking their original click.
- Modify the agreed CTA/contact templates: add data attributes only; do not change destinations, text, classes, or handlers.
- Modify `src/app/core/components/header/header.html`: annotate the three booking CTAs and four language buttons.
- Modify `src/app/features/booking/booking.ts`: observe widget visibility once and disconnect safely.
- Modify `src/app/features/booking/booking.spec.ts`: test one-time widget visibility and existing scroll behaviour.
- Create `scripts/analytics-tracking-coverage.test.mjs`: static coverage for every agreed template interaction.
- Modify `package.json`: expose the static tracking test as `test:analytics`.

### Task 1: Browser-safe GA4 event service

**Files:**
- Create: `src/app/shared/services/analytics.service.spec.ts`
- Create: `src/app/shared/services/analytics.service.ts`

- [ ] **Step 1: Write the failing service tests**

Create tests that install a temporary `window.gtag`, call `track`, and expect this exact payload shape:

```ts
expect(pushed[0]).toEqual([
  'event',
  'book_now_click',
  {
    cta_location: 'homepage_hero',
    page_path: '/hr/',
    site_language: 'hr',
  },
]);
```

Add cases proving that:

```ts
delete (window as unknown as { gtag?: unknown }).gtag;
expect(() => service.track('book_now_click', { cta_location: 'homepage_hero' })).not.toThrow();
```

and a throwing `gtag` implementation also cannot escape `track`.

- [ ] **Step 2: Run the new service spec and verify RED**

Run:

```bash
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npx ng test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/shared/services/analytics.service.spec.ts'
```

Expected: FAIL because `AnalyticsService` does not exist.

- [ ] **Step 3: Implement the minimal analytics service**

Create this public API:

```ts
export type AnalyticsEventName =
  | 'book_now_click'
  | 'booking_widget_view'
  | 'contact_click'
  | 'language_switch';

export type AnalyticsEventParameters = Record<string, string | number | boolean>;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly doc = inject(DOCUMENT);

  track(eventName: AnalyticsEventName, parameters: AnalyticsEventParameters = {}): void {
    if (!this.isBrowser) return;
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== 'function') return;

    const pagePath = window.location.pathname || '/';
    const documentLanguage = this.doc.documentElement.lang.toLowerCase();
    const siteLanguage = documentLanguage.startsWith('hr') || pagePath === '/hr' || pagePath.startsWith('/hr/')
      ? 'hr'
      : 'en';

    try {
      gtag('event', eventName, {
        ...parameters,
        page_path: pagePath,
        site_language: siteLanguage,
      });
    } catch {
      // Analytics must never interfere with the visitor's original action.
    }
  }
}
```

- [ ] **Step 4: Run the service spec and verify GREEN**

Run the Step 2 command. Expected: all `AnalyticsService` tests pass.

- [ ] **Step 5: Commit the service**

```bash
git add src/app/shared/services/analytics.service.ts src/app/shared/services/analytics.service.spec.ts
git commit -m "feat: add safe GA4 interaction service"
```

### Task 2: Explicit click-event routing

**Files:**
- Create: `src/app/shared/services/interaction-tracking.service.spec.ts`
- Create: `src/app/shared/services/interaction-tracking.service.ts`
- Modify: `src/app/app.ts`
- Modify: `src/app/app.spec.ts`

- [ ] **Step 1: Write failing click-routing tests**

Test an annotated nested click target:

```ts
const link = document.createElement('a');
link.dataset['analyticsEvent'] = 'contact_click';
link.dataset['analyticsLocation'] = 'footer_contact';
link.dataset['contactMethod'] = 'phone';
const child = document.createElement('span');
link.appendChild(child);

service.handleClick(new MouseEvent('click', { bubbles: true }), child);

expect(analytics.track).toHaveBeenCalledOnceWith('contact_click', {
  cta_location: 'footer_contact',
  contact_method: 'phone',
});
```

Also test:

- unannotated controls do nothing;
- unknown event names do nothing;
- clicking the already-active language (`from_language === to_language`) does nothing;
- `book_now_click` includes only `cta_location`;
- `language_switch` includes `from_language`, `to_language`, and `cta_location`.

- [ ] **Step 2: Run the interaction spec and verify RED**

Run:

```bash
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npx ng test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/shared/services/interaction-tracking.service.spec.ts'
```

Expected: FAIL because `InteractionTrackingService` does not exist.

- [ ] **Step 3: Implement allow-listed annotation parsing**

Implement `handleClick(event: Event, explicitTarget?: EventTarget | null)` using `Element.closest('[data-analytics-event]')`. Accept only the four `AnalyticsEventName` values and map these attributes:

```text
data-analytics-location -> cta_location
data-contact-method     -> contact_method
data-from-language      -> from_language
data-to-language        -> to_language
```

Do not call `preventDefault`, `stopPropagation`, or mutate the target.

- [ ] **Step 4: Connect the root component**

Add the service and host listener to `App`:

```ts
private readonly interactionTracking = inject(InteractionTrackingService);

@HostListener('click', ['$event'])
protected trackInteraction(event: Event): void {
  this.interactionTracking.handleClick(event);
}
```

Add an app spec that clicks an annotated anchor and verifies both the analytics call and a separate native click listener execute.

- [ ] **Step 5: Run interaction and app specs and verify GREEN**

Run:

```bash
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npx ng test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/shared/services/interaction-tracking.service.spec.ts' --include='src/app/app.spec.ts'
```

Expected: all included tests pass.

- [ ] **Step 6: Commit click routing**

```bash
git add src/app/shared/services/interaction-tracking.service.ts src/app/shared/services/interaction-tracking.service.spec.ts src/app/app.ts src/app/app.spec.ts
git commit -m "feat: route annotated interactions to GA4"
```

### Task 3: Annotate the agreed controls

**Files:**
- Create: `scripts/analytics-tracking-coverage.test.mjs`
- Modify: `scripts/book-now-cta-links.test.mjs`
- Modify: `package.json`
- Modify booking CTA templates listed in `scripts/book-now-cta-links.test.mjs`
- Modify: `src/app/core/components/footer/footer.html`
- Modify: `src/app/core/components/header/header.html`
- Modify: `src/app/features/contact/contact.html`

- [ ] **Step 1: Write the failing static coverage test**

The Node test must parse complete opening `<a>`/`<button>` tags and assert:

```js
assert.match(tag, /data-analytics-event="book_now_click"/);
assert.match(tag, /data-analytics-location="[a-z0-9_]+"/);
```

for every locale-aware booking-widget CTA already counted by `book-now-cta-links.test.mjs`.

It must also assert that every `mailto:` and `tel:` link has:

```html
data-analytics-event="contact_click"
data-contact-method="email|phone"
data-analytics-location="..."
```

and that the four header language buttons have `language_switch`, `desktop_header` or `mobile_menu`, and bound/current source plus fixed destination-language values.

- [ ] **Step 2: Run the static test and verify RED**

Run:

```bash
node --test scripts/analytics-tracking-coverage.test.mjs
```

Expected: FAIL on the first unannotated agreed control.

- [ ] **Step 3: Add explicit booking CTA annotations**

Add these two attributes without changing any existing attribute:

```html
data-analytics-event="book_now_click"
data-analytics-location="<location below>"
```

Use these stable locations in source order:

```text
core/components/experience: home_experience
core/components/header: desktop_header, mobile_header, mobile_menu
core/components/hero: home_intro_primary, home_intro_card
core/components/trailer: homepage_hero, homepage_booking_dock
core/components/visit: home_visit
features/about: about_intro
features/booking: booking_hero
features/blog/blog-post-page: blog_post_footer, blog_post_sidebar
features/contact: visit_hero, visit_location, visit_individual, visit_hours, visit_seasonal, visit_booking_panel, visit_closing
features/experience: experience_intro, experience_trailer, experience_reconstruction, experience_detail, experience_closing
features/partners: partners_closing
shared/components/cta-block: blog_index_cta
```

- [ ] **Step 4: Add contact and language annotations**

For the five contact-page email links, use locations in source order:

```text
group_email_button
group_email_link
accessibility_email
visit_hours_email
seasonal_email
```

For the footer email and two telephone links, use `footer_contact`; set `data-contact-method` to `email` or `phone`.

For the header language buttons, add:

```html
data-analytics-event="language_switch"
[attr.data-from-language]="currentLang()"
data-to-language="en|hr"
data-analytics-location="desktop_header|mobile_menu"
```

- [ ] **Step 5: Add the package script and verify GREEN**

Add:

```json
"test:analytics": "node --test scripts/analytics-tracking-coverage.test.mjs"
```

Run:

```bash
npm run test:analytics
node --test scripts/book-now-cta-links.test.mjs
```

Expected: all static tracking and destination tests pass.

- [ ] **Step 6: Commit annotations**

```bash
git add package.json scripts/analytics-tracking-coverage.test.mjs scripts/book-now-cta-links.test.mjs src/app
git commit -m "feat: annotate focused conversion interactions"
```

### Task 4: Track booking widget visibility once

**Files:**
- Modify: `src/app/features/booking/booking.spec.ts`
- Modify: `src/app/features/booking/booking.ts`

- [ ] **Step 1: Write failing Booking visibility tests**

Install an `IntersectionObserver` test double before creating the fixture. Verify the observer uses threshold `0.5`, observes `#booking-widget`, and on the first qualifying entry calls:

```ts
expect(analytics.track).toHaveBeenCalledOnceWith('booking_widget_view', {
  cta_location: 'booking_widget',
});
```

Invoke the callback a second time and expect no second event. Destroy the fixture and expect `disconnect` to have been called. Preserve the existing component creation test and add a spy proving `scrollToWidget` still calls `preventDefault` and `scrollIntoView`.

- [ ] **Step 2: Run the Booking spec and verify RED**

Run:

```bash
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npx ng test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/features/booking/booking.spec.ts'
```

Expected: FAIL because widget visibility is not observed.

- [ ] **Step 3: Implement one-time visibility tracking**

Make `Booking` implement `AfterViewInit`. Inject `AnalyticsService`, store the observer, and create it only in the browser when `#booking-widget` exists. Use `{ threshold: 0.5 }`; on the first `isIntersecting && intersectionRatio >= 0.5`, send the event and disconnect. Disconnect again defensively in `ngOnDestroy` while retaining the existing SEO cleanup and TuriTop code exactly.

- [ ] **Step 4: Run the Booking and analytics specs and verify GREEN**

Run:

```bash
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npx ng test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/features/booking/booking.spec.ts' --include='src/app/shared/services/analytics.service.spec.ts'
```

Expected: all included tests pass.

- [ ] **Step 5: Commit widget visibility tracking**

```bash
git add src/app/features/booking/booking.ts src/app/features/booking/booking.spec.ts
git commit -m "feat: track booking widget visibility"
```

### Task 5: Full verification and SiteGround archive

**Files:**
- Verify unchanged: `src/app/features/thank-you/thank-you.ts`
- Verify unchanged: `src/assets/vendor/turitop-thankyou.js`
- Create/replace: `site.zip`

- [ ] **Step 1: Verify protected purchase files were not modified**

Run:

```bash
git diff a1d4282 -- src/app/features/thank-you/thank-you.ts src/assets/vendor/turitop-thankyou.js
```

Expected: no output.

- [ ] **Step 2: Run the complete focused test set**

Run:

```bash
npm run test:analytics
node --test scripts/book-now-cta-links.test.mjs
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npx ng test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/shared/services/analytics.service.spec.ts' --include='src/app/shared/services/interaction-tracking.service.spec.ts' --include='src/app/app.spec.ts' --include='src/app/features/booking/booking.spec.ts' --include='src/app/core/components/header/header.spec.ts'
```

Expected: zero failures.

- [ ] **Step 3: Run the complete production build**

Run:

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true npm run build
```

Expected: exit code 0; Angular build, sitemap generation, and `verify-build.mjs` all succeed.

- [ ] **Step 4: Inspect the final diff and production event markers**

Run:

```bash
git diff --check
rg -n "book_now_click|booking_widget_view|contact_click|language_switch" dist/diocletiansdream/browser
```

Expected: no whitespace errors and all four event names are present in built JavaScript/HTML.

- [ ] **Step 5: Create a clean SiteGround archive**

From `dist/diocletiansdream/browser`, create a new archive whose root contains `index.html`, `sitemap.xml`, localized routes, assets, and `dd-thankyou/`. Exclude `.DS_Store` and any existing archive. Write the final archive to the project root as `site.zip`.

- [ ] **Step 6: Verify the archive**

Run:

```bash
unzip -t site.zip
unzip -l site.zip
```

Expected: integrity test reports no errors; `index.html`, `sitemap.xml`, `assets/`, and `dd-thankyou/index.html` are present at the archive root, with no `dist/`, source files, `.git`, or nested `site.zip`.

- [ ] **Step 7: Commit source work but not the deployable archive unless already established by repository policy**

Stage only source, test, and documentation changes. Keep `site.zip` available for the user even if ignored by Git.
