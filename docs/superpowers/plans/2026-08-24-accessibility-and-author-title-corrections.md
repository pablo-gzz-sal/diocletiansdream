# Accessibility and Author Title Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the two invalid ARIA usages and replace Academician/Akademik with the grammatically correct Professor/Profesor wording in English and Croatian without changing website behavior.

**Architecture:** Make two semantic-only template edits and localized copy edits. Lock both behaviors with focused Angular DOM tests and a Node locale-contract test, then use the existing full suite and production build as the preservation boundary for SEO, prerendering, booking, and thank-you behavior.

**Tech Stack:** Angular 20 standalone components, Jasmine/Karma, Node.js test runner, JSON locale files, Angular SSR/prerender build verification.

---

## File structure

- Modify `src/app/core/components/highlights/highlights.spec.ts`: regression coverage for the decorative marquee wrapper.
- Modify `src/app/core/components/highlights/highlights.html`: remove the invalid generic-container label.
- Modify `src/app/core/components/reviews/reviews.spec.ts`: regression coverage for the labeled star-rating image role.
- Modify `src/app/core/components/reviews/reviews.html`: add the permitted semantic role.
- Create `scripts/author-title-copy.test.mjs`: bilingual title and stale-copy contract.
- Modify `src/assets/i18n/en.json`: English display, FAQ, and SEO copy.
- Modify `src/assets/i18n/hr.json`: Croatian display, FAQ, and grammatically inflected SEO copy.

No hero, routing, analytics, consent, booking, sitemap, SEO service, structured-data implementation, or thank-you files are modified.

### Task 1: Correct the ARIA semantics

**Files:**
- Modify: `src/app/core/components/highlights/highlights.spec.ts`
- Modify: `src/app/core/components/reviews/reviews.spec.ts`
- Modify: `src/app/core/components/highlights/highlights.html:1`
- Modify: `src/app/core/components/reviews/reviews.html:27`

- [ ] **Step 1: Add the failing highlights regression test**

Append this test inside `describe('Highlights', ...)`:

```typescript
it('does not label the decorative marquee through a generic div', () => {
  const wrapper = fixture.nativeElement.querySelector('.marquee-wrap') as HTMLElement;

  expect(wrapper).not.toBeNull();
  expect(wrapper.hasAttribute('aria-label')).toBeFalse();
  expect(wrapper.querySelector('.marquee-track')?.getAttribute('aria-hidden')).toBe('true');
});
```

- [ ] **Step 2: Add the failing reviews regression test**

Append this test inside `describe('Reviews', ...)`:

```typescript
it('exposes the five-star rating as one labelled image', () => {
  const stars = fixture.nativeElement.querySelector('.reviews-stars') as HTMLElement;

  expect(stars).not.toBeNull();
  expect(stars.getAttribute('role')).toBe('img');
  expect(stars.getAttribute('aria-label')).toBe('5 out of 5 stars');
  expect(stars.querySelectorAll('svg[aria-hidden="true"]').length).toBe(5);
});
```

- [ ] **Step 3: Run the focused Angular tests and verify RED**

Run:

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' /usr/local/bin/node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --progress=false --include='src/app/core/components/highlights/highlights.spec.ts' --include='src/app/core/components/reviews/reviews.spec.ts'
```

Expected: two assertion failures—`.marquee-wrap` still has `aria-label`, and `.reviews-stars` has no `role="img"`.

- [ ] **Step 4: Apply the minimal template corrections**

Change the first line of `highlights.html` to:

```html
<div class="marquee-wrap">
```

Change the star container in `reviews.html` to:

```html
<div class="reviews-stars" role="img" aria-label="5 out of 5 stars">
```

- [ ] **Step 5: Rerun the focused tests and verify GREEN**

Run the Step 3 command again.

Expected: all focused tests pass.

- [ ] **Step 6: Commit the semantic corrections**

```bash
git add src/app/core/components/highlights/highlights.html src/app/core/components/highlights/highlights.spec.ts src/app/core/components/reviews/reviews.html src/app/core/components/reviews/reviews.spec.ts
git commit -m "fix: correct homepage aria semantics"
```

### Task 2: Replace the bilingual author title

**Files:**
- Create: `scripts/author-title-copy.test.mjs`
- Modify: `src/assets/i18n/en.json:51,295,540,554`
- Modify: `src/assets/i18n/hr.json:51,295,540,554`

- [ ] **Step 1: Create the failing locale contract**

Create `scripts/author-title-copy.test.mjs` with:

```javascript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const loadLocale = (locale) =>
  JSON.parse(readFileSync(`src/assets/i18n/${locale}.json`, 'utf8'));

const en = loadLocale('en');
const hr = loadLocale('hr');

test('English copy identifies Josip Belamarić as Professor everywhere', () => {
  assert.equal(en.home.authority.honorific, 'Professor');
  assert.match(en.experiencePage.faq.items[9].a, /Professor Josip Belamarić/);
  assert.match(en.aboutPage.faq.items[3].a, /Professor Josip Belamarić/);
  assert.match(en.aboutPage.seo.metaDescription, /Professor Josip Belamarić/);
  assert.doesNotMatch(JSON.stringify(en), /academician/i);
});

test('Croatian copy uses Profesor with grammatically correct inflection', () => {
  assert.equal(hr.home.authority.honorific, 'Profesor');
  assert.match(hr.experiencePage.faq.items[9].a, /profesor Josip Belamarić/);
  assert.match(hr.aboutPage.faq.items[3].a, /profesor Josip Belamarić/);
  assert.match(hr.aboutPage.seo.metaDescription, /profesora Josipa Belamarića/);
  assert.doesNotMatch(JSON.stringify(hr), /akademik/i);
});
```

- [ ] **Step 2: Run the locale contract and verify RED**

Run:

```bash
node --test scripts/author-title-copy.test.mjs
```

Expected: both tests fail because the locale files still contain Academician/Akademik.

- [ ] **Step 3: Apply the exact English replacements**

In `src/assets/i18n/en.json`:

```json
"honorific": "Professor"
```

Replace the two FAQ occurrences of `Academician Josip Belamarić` with `Professor Josip Belamarić`, and change the meta description to:

```json
"metaDescription": "Diocletian's Dream is a VR museum in Split rebuilding Diocletian's Palace in 305 AD. Opened 2020, researched with Professor Josip Belamarić, 8 languages."
```

- [ ] **Step 4: Apply the exact Croatian replacements**

In `src/assets/i18n/hr.json`:

```json
"honorific": "Profesor"
```

Replace both nominative FAQ occurrences of `akademik Josip Belamarić` with `profesor Josip Belamarić`, and change the meta description to:

```json
"metaDescription": "Diocletian's Dream je VR muzej u Splitu koji obnavlja Dioklecijanovu palaču iz 305. godine. Otvoren 2020., uz savjet profesora Josipa Belamarića."
```

- [ ] **Step 5: Rerun the locale contract and verify GREEN**

Run:

```bash
node --test scripts/author-title-copy.test.mjs
```

Expected: 2 tests pass, 0 fail.

- [ ] **Step 6: Commit the bilingual copy correction**

```bash
git add scripts/author-title-copy.test.mjs src/assets/i18n/en.json src/assets/i18n/hr.json
git commit -m "fix: update Josip Belamaric title"
```

### Task 3: Verify preservation and production output

**Files:**
- Verify only; no source changes expected.

- [ ] **Step 1: Run every static contract**

```bash
npm run test:mobile-gutters
npm run test:mobile-headings
npm run test:mobile-performance
npm run test:legal-pages
node --test scripts/author-title-copy.test.mjs
```

Expected: every Node test passes.

- [ ] **Step 2: Run the full Angular suite**

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' /usr/local/bin/node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --progress=false
```

Expected: 163 existing tests plus the two new tests pass. The baseline test server may continue to log its known asset 404 warnings; there must be no test failures.

- [ ] **Step 3: Run the production build and SEO verification**

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true /usr/local/bin/npm run build
```

Expected: build exits 0, 78 routes prerender, sitemap generation reports 75 indexable URLs, and `verify-build` reports no stray 404 markers. The existing BlogListPage unused-import warning may remain unchanged.

- [ ] **Step 4: Prove protected files were untouched**

```bash
git diff --name-only HEAD~2..HEAD
git diff --exit-code HEAD~2..HEAD -- src/app/core/components/trailer src/app/features/thank-you src/assets/vendor/turitop-thankyou.js src/index.html src/app/shared/services/seo-service.ts scripts/generate-sitemap.mjs scripts/verify-build.mjs
```

Expected: the first command lists only the seven implementation/test files declared above; the second command prints nothing and exits 0.

- [ ] **Step 5: Confirm stale titles and invalid ARIA are absent**

```bash
rg -n -i 'academician|akademik|aria-label="highlights"' src
rg -n 'reviews-stars.*role="img".*aria-label="5 out of 5 stars"' src/app/core/components/reviews/reviews.html
git status --short
```

Expected: the stale-copy search returns no matches; the review role search returns one match; the worktree is clean.
