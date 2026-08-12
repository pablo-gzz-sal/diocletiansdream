# Uniform Mobile Page Gutters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every mobile page one 16 px content gutter, widen the Booking calendar, and preserve component-internal and desktop spacing.

**Architecture:** A shared `dd-page-gutter` utility will replace the repeated feature-level `px-6 lg:px-8` pair and reproduce the current tablet/desktop values while reducing only the mobile value to 16 px. Booking will keep its existing 16 px inner containers and reset the legacy outer horizontal section padding below 768 px, eliminating the stacked 48 px gutter.

**Tech Stack:** Angular 20 templates, global CSS, component CSS, Node.js built-in test runner, Karma/Jasmine, Angular CLI production build.

---

### Task 1: Add a failing regression contract

**Files:**
- Create: `scripts/mobile-page-gutters.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

Create `scripts/mobile-page-gutters.test.mjs` with three checks: the shared utility has 16/24/32 px breakpoints, no template retains the legacy page-edge `px-6 lg:px-8` pair, and Booking resets its four outer sections to zero horizontal padding on mobile.

```js
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? htmlFiles(path)
      : entry.name.endsWith('.html')
        ? [path]
        : [];
  });
}

test('shared page gutter is 16 px on mobile and preserves larger breakpoints', () => {
  const css = read('src/styles.css');
  assert.match(css, /\.dd-page-gutter\s*\{[^}]*padding-inline:\s*1rem/s);
  assert.match(css, /@media\s*\(min-width:\s*768px\)[\s\S]*?\.dd-page-gutter\s*\{[^}]*padding-inline:\s*1\.5rem/s);
  assert.match(css, /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.dd-page-gutter\s*\{[^}]*padding-inline:\s*2rem/s);
});

test('page templates use the shared gutter instead of the legacy pair', () => {
  const offenders = htmlFiles('src/app')
    .filter((path) => read(path).includes('px-6 lg:px-8'));
  assert.deepEqual(offenders, []);
});

test('booking has only its inner 16 px gutter on mobile', () => {
  const css = read('src/app/features/booking/booking.css');
  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.booking-hero,[\s\S]*?\.booking-widget-section,[\s\S]*?\.booking-faq,[\s\S]*?\.map-section\s*\{[^}]*padding-inline:\s*0/s,
  );
});
```

Add the script to `package.json`:

```json
"test:mobile-gutters": "node --test scripts/mobile-page-gutters.test.mjs"
```

- [ ] **Step 2: Run the regression test and verify it fails**

Run:

```bash
npm run test:mobile-gutters
```

Expected: FAIL because `dd-page-gutter` and Booking's mobile reset do not exist and templates still contain `px-6 lg:px-8`.

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/mobile-page-gutters.test.mjs package.json
git commit -m "test: define mobile page gutter contract"
```

### Task 2: Implement the shared page-edge gutter

**Files:**
- Modify: `src/styles.css`
- Modify: `src/app/features/about/about.html`
- Modify: `src/app/features/experience/experience.html`
- Modify: `src/app/features/contact/contact.html`
- Modify: `src/app/features/blog/blog-list-page/blog-list-page.html`
- Modify: `src/app/features/blog/blog-post-page/blog-post-page.html`
- Modify: `src/app/features/legal/policy-page-component/policy-page-component.html`
- Modify: `src/app/features/not-found/not-found.html`
- Modify: `src/app/features/thank-you/thank-you.html`
- Modify: `src/app/core/components/footer/footer.html`
- Modify: `src/app/shared/components/blog-invite/blog-invite.html`
- Modify: `src/app/shared/components/cta-block/cta-block.html`

- [ ] **Step 1: Add the responsive shared utility**

Add to the shared layout section in `src/styles.css`:

```css
.dd-page-gutter {
  padding-inline: 1rem;
}

@media (min-width: 768px) {
  .dd-page-gutter {
    padding-inline: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .dd-page-gutter {
    padding-inline: 2rem;
  }
}
```

- [ ] **Step 2: Move page-level wrappers to the shared utility**

In each listed template, replace page-edge occurrences of:

```html
px-6 lg:px-8
```

with:

```html
dd-page-gutter
```

Do not change internal `px-6` classes on FAQ rows, cards, buttons, badges, or controls. Do not change the Header shell, whose spacing belongs to the floating navigation layout.

- [ ] **Step 3: Run the regression test**

Run:

```bash
npm run test:mobile-gutters
```

Expected: the utility/template checks PASS; the Booking check still FAILS.

- [ ] **Step 4: Commit the shared utility and templates**

```bash
git add src/styles.css src/app/features src/app/core/components/footer/footer.html src/app/shared/components/blog-invite/blog-invite.html src/app/shared/components/cta-block/cta-block.html
git commit -m "style: standardize mobile page gutters"
```

### Task 3: Remove Booking's doubled mobile gutter

**Files:**
- Modify: `src/app/features/booking/booking.css`

- [ ] **Step 1: Add the mobile-only outer-section reset**

Add after the base Booking section padding rules:

```css
@media (max-width: 767px) {
  .booking-hero,
  .booking-widget-section,
  .booking-faq,
  .map-section {
    padding-inline: 0;
  }
}
```

The existing `.booking-hero__inner`, `.booking-widget-inner`, `.booking-faq__inner`, and `.map-section__inner` rules continue to provide the single 16 px gutter through `--dd-page-x`.

- [ ] **Step 2: Run the regression test**

Run:

```bash
npm run test:mobile-gutters
```

Expected: all three tests PASS.

- [ ] **Step 3: Run the Booking component test**

Run:

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' /usr/local/bin/node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/features/booking/booking.spec.ts'
```

Expected: PASS.

- [ ] **Step 4: Commit the Booking fix**

```bash
git add src/app/features/booking/booking.css
git commit -m "fix: widen booking widget on mobile"
```

### Task 4: Verify every page and publish

**Files:**
- Verify only: all changed files and generated `dist/diocletiansdream/browser`

- [ ] **Step 1: Run the full automated test suite**

Run:

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' /usr/local/bin/node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --progress=false
```

Expected: all tests PASS.

- [ ] **Step 2: Build the production site**

Run:

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true /usr/local/bin/npm run build
```

Expected: Angular build, sitemap generation, and build verification all complete successfully.

- [ ] **Step 3: Inspect 320 px and 390 px layouts**

Serve the production build and inspect Home, Experience, About, Booking, Visit, Blog, Partners, Privacy, Terms, Cookies, Thank-you, and not-found routes. Confirm each content wrapper starts 16 px from the viewport edge, there is no horizontal overflow, and the Booking calendar/card uses the available width. Confirm a desktop viewport retains the existing spacing.

- [ ] **Step 4: Republish to the permanent preview URL**

Run:

```bash
/Users/gordansabic/.claude/skills/here-now/scripts/publish.sh dist/diocletiansdream/browser --slug pearly-dory-g7y4 --client codex
```

Expected: `https://pearly-dory-g7y4.here.now/` is updated successfully.
