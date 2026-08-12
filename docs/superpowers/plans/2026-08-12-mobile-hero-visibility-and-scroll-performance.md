# Mobile Hero Visibility and Scroll Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore mobile H1 visibility, sequence the homepage title and booking dock, and remove the remaining avoidable inner-page scroll costs without changing desktop presentation.

**Architecture:** Add narrow semantic hooks to the three shared inner-page hero titles and a mobile-only dock state driven by the Trailer component's existing `heroCopyVisible` timeline. Move the header's scroll state work to one passive listener throttled by `requestAnimationFrame`, render the mobile overlay only while open, and codify the mobile performance requirements in a small Node regression test.

**Tech Stack:** Angular 20 standalone components, Angular signals and control flow, CSS media queries, Jasmine/Karma, Node's built-in test runner, here.now static hosting.

---

## File Structure

- Create `scripts/mobile-hero-performance.test.mjs`: static regression contract for hero hooks, fixed-background removal, and header listener lifecycle.
- Modify `package.json`: expose the new static regression test as `test:mobile-performance`.
- Modify `src/app/features/experience/experience.html`: mark the shared Experience H1 reveal span.
- Modify `src/app/features/contact/contact.html`: mark the shared Visit H1 reveal span.
- Modify `src/app/features/about/about.html`: mark the shared About H1 reveal span.
- Modify `src/styles.css`: force marked H1 spans visible for mobile/reduced motion and make the mobile body background scroll normally.
- Modify `src/app/core/components/trailer/trailer.html`: bind a mobile-only hidden-state class on the booking dock.
- Modify `src/app/core/components/trailer/trailer.css`: hide the dock only on mobile while the hero copy is visible.
- Modify `src/app/core/components/trailer/trailer.spec.ts`: verify the dock state tracks the inverse of `heroCopyVisible`.
- Modify `src/app/core/components/header/header.ts`: replace the global host scroll handler with a passive, animation-frame-throttled listener and cleanup.
- Modify `src/app/core/components/header/header.html`: instantiate the fixed mobile menu layer only while it is open.
- Modify `src/app/core/components/header/header.spec.ts`: verify the closed/open menu-layer lifecycle and preserve its booking CTA.

### Task 1: Add the Failing Mobile Performance Contract

**Files:**
- Create: `scripts/mobile-hero-performance.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the static regression test**

Create `scripts/mobile-hero-performance.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

const heroTemplates = [
  'src/app/features/experience/experience.html',
  'src/app/features/contact/contact.html',
  'src/app/features/about/about.html',
];

test('secondary-page hero titles have a mobile visibility hook', () => {
  for (const path of heroTemplates) {
    assert.match(read(path), /class="[^"]*page-hero-title-line[^"]*"/);
  }
});

test('mobile and reduced-motion modes reveal the hero titles', () => {
  const css = read('src/styles.css');

  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\),\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.page-hero-title-line\s*\{[^}]*opacity:\s*1\s*!important[^}]*transform:\s*none\s*!important/s,
  );
});

test('mobile backgrounds scroll instead of repainting as fixed layers', () => {
  const css = read('src/styles.css');

  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?body\s*\{[^}]*background-attachment:\s*scroll\s*!important/s,
  );
});

test('header scrolling is passive, frame-throttled, and cleaned up', () => {
  const header = read('src/app/core/components/header/header.ts');

  assert.doesNotMatch(header, /@HostListener\(['"]window:scroll['"]\)/);
  assert.match(header, /addEventListener\(['"]scroll['"],\s*handleScroll,\s*\{\s*passive:\s*true\s*\}\)/s);
  assert.match(header, /requestAnimationFrame\(/);
  assert.match(header, /removeEventListener\(['"]scroll['"],\s*handleScroll\)/s);
  assert.match(header, /cancelAnimationFrame\(/);
});
```

- [ ] **Step 2: Add the package script**

Add this entry under `scripts` in `package.json`:

```json
"test:mobile-performance": "node --test scripts/mobile-hero-performance.test.mjs"
```

- [ ] **Step 3: Run the test and verify it fails for the intended missing contracts**

Run:

```bash
npm run test:mobile-performance
```

Expected: FAIL because the three title hooks, mobile background override, and passive frame-throttled header listener are not implemented yet.

- [ ] **Step 4: Commit the failing contract**

```bash
git add package.json scripts/mobile-hero-performance.test.mjs
git commit -m "test: define mobile hero and scroll contracts"
```

### Task 2: Restore Inner-Page H1 Visibility and Remove Fixed Mobile Background Repaints

**Files:**
- Modify: `src/app/features/experience/experience.html:54-56`
- Modify: `src/app/features/contact/contact.html:56-58`
- Modify: `src/app/features/about/about.html:58-60`
- Modify: `src/styles.css`

- [ ] **Step 1: Add the shared semantic class to all three H1 spans**

In each template, preserve the existing classes and add `page-hero-title-line`:

```html
<span
  class="page-hero-title-line block text-[clamp(2.75rem,7vw,5.5rem)] opacity-0 translate-y-3 animate-[revealLine_0.9s_cubic-bezier(0.16,1,0.3,1)_0.05s_forwards]"
>
```

The translation expression inside each span remains unchanged, so English and Croatian routes continue sharing the same markup.

- [ ] **Step 2: Add the mobile/reduced-motion visibility override and mobile body rule**

Append the title rule after the existing animation declarations in `src/styles.css`:

```css
@media (max-width: 767px), (prefers-reduced-motion: reduce) {
  .page-hero-title-line {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

Inside the existing `@media (max-width: 767px)` mobile performance block, add:

```css
body {
  background-attachment: scroll !important;
}
```

- [ ] **Step 3: Run the focused static test**

```bash
npm run test:mobile-performance
```

Expected: the first three tests PASS; the header listener lifecycle test still FAILS.

- [ ] **Step 4: Run the existing heading and gutter regressions**

```bash
npm run test:mobile-headings
npm run test:mobile-gutters
```

Expected: both suites PASS with no character-level heading wrapping and the 16 px mobile gutter unchanged.

- [ ] **Step 5: Commit the title and background fix**

```bash
git add src/app/features/experience/experience.html src/app/features/contact/contact.html src/app/features/about/about.html src/styles.css
git commit -m "fix: restore mobile page titles and scrolling background"
```

### Task 3: Sequence the Homepage Title and Booking Dock on Mobile

**Files:**
- Modify: `src/app/core/components/trailer/trailer.spec.ts`
- Modify: `src/app/core/components/trailer/trailer.html:61`
- Modify: `src/app/core/components/trailer/trailer.css:340-389`

- [ ] **Step 1: Write the failing Trailer component test**

Add to `src/app/core/components/trailer/trailer.spec.ts`:

```ts
it('marks the mobile booking dock hidden exactly while the hero copy is visible', () => {
  const component = fixture.componentInstance;

  component.heroCopyVisible = true;
  fixture.detectChanges();
  let bookingDock = fixture.nativeElement.querySelector('.booking-dock') as HTMLElement;
  expect(bookingDock.classList.contains('booking-dock--mobile-hidden')).toBeTrue();

  component.heroCopyVisible = false;
  fixture.detectChanges();
  bookingDock = fixture.nativeElement.querySelector('.booking-dock') as HTMLElement;
  expect(bookingDock.classList.contains('booking-dock--mobile-hidden')).toBeFalse();
});
```

- [ ] **Step 2: Run the Trailer spec and verify the new test fails**

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' /usr/local/bin/node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/core/components/trailer/trailer.spec.ts'
```

Expected: FAIL because `booking-dock--mobile-hidden` is not yet bound.

- [ ] **Step 3: Bind the dock state to the existing hero timeline**

Change the opening booking dock tag in `trailer.html` to:

```html
<section
  class="booking-dock"
  [class.booking-dock--mobile-hidden]="heroCopyVisible"
  [attr.aria-label]="'home.heroConversion.bookingInfo' | translate"
>
```

- [ ] **Step 4: Hide that state only in the mobile media query**

Inside `@media (max-width: 640px)` in `trailer.css`, before the base `.booking-dock` rule, add:

```css
.booking-dock.booking-dock--mobile-hidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}
```

Do not add a desktop rule for this class. The existing title CTA remains available while the dock is hidden, and `visibility: hidden` removes the duplicate dock controls from focus and accessibility navigation on mobile.

- [ ] **Step 5: Run the Trailer spec and verify it passes**

Run the command from Step 2.

Expected: all Trailer specs PASS.

- [ ] **Step 6: Commit the homepage sequencing change**

```bash
git add src/app/core/components/trailer/trailer.html src/app/core/components/trailer/trailer.css src/app/core/components/trailer/trailer.spec.ts
git commit -m "fix: sequence mobile hero copy and booking dock"
```

### Task 4: Throttle Header Scroll Work and Render the Menu Layer Only While Open

**Files:**
- Modify: `src/app/core/components/header/header.spec.ts`
- Modify: `src/app/core/components/header/header.html:153-end`
- Modify: `src/app/core/components/header/header.ts:1-56,67-69,102-105`

- [ ] **Step 1: Replace the eager menu test with a failing closed/open lifecycle test**

Replace the current `keeps the booking action in the 16 px-aligned mobile menu` test with:

```ts
it('renders the fixed mobile menu layer only while the menu is open', () => {
  expect(fixture.nativeElement.querySelector('.dd-mobile-menu-layer')).toBeNull();

  component.toggleMenu();
  fixture.detectChanges();

  const menuPanel = fixture.nativeElement.querySelector(
    '.dd-mobile-menu-panel',
  ) as HTMLElement | null;
  const bookingLink = fixture.nativeElement.querySelector(
    '[data-testid="mobile-menu-booking-cta"]',
  ) as HTMLAnchorElement | null;

  expect(menuPanel?.classList.contains('right-4')).toBeTrue();
  expect(bookingLink?.getAttribute('href')).toBe('/booking');

  component.closeMenu();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('.dd-mobile-menu-layer')).toBeNull();
});
```

- [ ] **Step 2: Run the Header spec and verify the lifecycle test fails**

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' /usr/local/bin/node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/core/components/header/header.spec.ts'
```

Expected: FAIL because the closed mobile menu layer is still present in the DOM.

- [ ] **Step 3: Render the menu overlay only when open**

Insert `@if (menuOpen()) {` immediately before the current `.dd-mobile-menu-layer`, replace the outer layer/backdrop/panel opening tags with the following, and add the matching `}` immediately after the layer's existing final closing `</div>`:

```html
@if (menuOpen()) {
  <div class="dd-mobile-menu-layer fixed inset-0 z-[60] md:hidden">
    <div
      class="absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 opacity-100"
      (click)="closeMenu()"
    ></div>

    <div
      class="dd-mobile-menu-panel absolute top-3 bottom-3 right-4 w-[82%] max-w-xs translate-x-0 rounded-[1rem] bg-cream opacity-100 shadow-[0_32px_80px_rgba(26,24,20,0.22)] border border-black/8 overflow-hidden flex flex-col transition-all duration-[350ms]"
      style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
    >
```

Leave every existing child from `<!-- grain -->` through the info strip between the panel's opening and closing tags. Remove only the three former open/closed `ngClass` bindings; the rendered layer is always open, so its former open-state classes (`opacity-100`, `translate-x-0`) are static. This preserves the cream panel, navigation, language controls, Book Now CTA, and information content byte-for-byte.

- [ ] **Step 4: Replace the host scroll listener with a passive frame-throttled listener**

Remove `HostListener` from the Angular import and add `NgZone`:

```ts
import {
  AfterViewInit,
  Component,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
```

Add these private fields next to the current browser/document fields:

```ts
private readonly zone = inject(NgZone);
private scrollFrame: number | null = null;
private removeScrollListener = () => {};
```

Replace `ngAfterViewInit()` and the `@HostListener` method with:

```ts
ngAfterViewInit() {
  if (!this.isBrowser) return;
  this.updateScrollState();

  this.zone.runOutsideAngular(() => {
    const handleScroll = () => {
      if (this.scrollFrame !== null) return;

      this.scrollFrame = window.requestAnimationFrame(() => {
        this.scrollFrame = null;
        this.zone.run(() => this.updateScrollState());
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    this.removeScrollListener = () => window.removeEventListener('scroll', handleScroll);
  });
}
```

Expand `ngOnDestroy()` to remove the listener and cancel any pending frame:

```ts
ngOnDestroy() {
  this.removeOverflow();
  this.removeScrollListener();

  if (this.scrollFrame !== null) {
    window.cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = null;
  }
}
```

- [ ] **Step 5: Run the Header spec and static performance contract**

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' /usr/local/bin/node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/core/components/header/header.spec.ts'
npm run test:mobile-performance
```

Expected: all Header specs PASS and all four static mobile performance tests PASS.

- [ ] **Step 6: Commit the header performance change**

```bash
git add src/app/core/components/header/header.ts src/app/core/components/header/header.html src/app/core/components/header/header.spec.ts
git commit -m "perf: reduce mobile header scroll work"
```

### Task 5: Full Regression, Mobile Visual Verification, and Publish

**Files:**
- Verify: all modified files and generated `dist/diocletiansdream/browser`

- [ ] **Step 1: Run every static mobile regression**

```bash
npm run test:mobile-gutters
npm run test:mobile-headings
npm run test:mobile-performance
```

Expected: every Node test passes.

- [ ] **Step 2: Run the full Angular test suite**

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' /usr/local/bin/node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --progress=false
```

Expected: the complete suite passes with zero failures.

- [ ] **Step 3: Produce and verify a production build**

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true /usr/local/bin/npm run build
```

Expected: Angular production build, sitemap generation, and `verify-build.mjs` all succeed; all localized routes prerender.

- [ ] **Step 4: Inspect the production build at 320 px and 390 px**

Serve `dist/diocletiansdream/browser`, then use the in-app browser to inspect:

```text
/experience/       /hr/iskustvo/
/visit/            /hr/posjetite-nas/
/about/            /hr/o-nama/
/                  /hr/
```

For each inner page, verify the H1 is visible, whole words remain intact, the computed body `background-attachment` is `scroll`, and the closed menu layer is absent. On both home routes, verify the dock is hidden during the opening title phase, becomes visible when the title disappears, and hides again when the title returns. Confirm desktop at 1280 px retains the title reveal, original dock presence, and existing menu/header layout.

- [ ] **Step 5: Publish the verified build to the existing here.now slug**

```bash
/Users/gordansabic/.claude/skills/here-now/scripts/publish.sh dist/diocletiansdream/browser --slug pearly-dory-g7y4 --client codex
```

Expected: publication succeeds at `https://pearly-dory-g7y4.here.now/` without creating a new slug.

- [ ] **Step 6: Smoke-test the live deployment**

Open the live English and Croatian routes at mobile width and repeat the critical checks from Step 4. Confirm the server returns the new build and no console errors appear.

- [ ] **Step 7: Record the verified result**

If verification required no further source changes, no extra commit is needed. If a verification-only correction was necessary, rerun Steps 1-6 and commit only that correction with a focused message before reporting completion.
