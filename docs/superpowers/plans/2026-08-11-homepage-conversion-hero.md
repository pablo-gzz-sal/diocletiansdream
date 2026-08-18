# Homepage Conversion Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage image introduction with a trailer-led conversion hero, booking dock, and readable heritage message flow.

**Architecture:** Reuse the focused `Trailer` component as the homepage hero so video loading and playback stay isolated. Simplify `LandingPage` to sequence the trailer hero, heritage keyword strip, experience, visit, reviews, and FAQ; adapt `Experience` into the first value section.

**Tech Stack:** Angular standalone components, Angular TestBed/Karma, ngx-translate JSON, CSS, GSAP.

---

### Task 1: Define and test the trailer hero contract

**Files:**
- Create: `src/app/core/components/trailer/trailer.spec.ts`
- Modify: `src/app/core/components/trailer/trailer.ts`
- Modify: `src/app/core/components/trailer/trailer.html`

- [ ] Write a TestBed spec that asserts the video has `autoplay`, `muted`, `loop`, and `playsinline`, then asserts the DOM contains `data-testid="hero-booking-cta"`.
- [ ] Run `npm test -- --watch=false --include='src/app/core/components/trailer/trailer.spec.ts'`; confirm the new test fails before the implementation exists.
- [ ] Add an `autoplayAllowed` browser/reduced-motion flag in `Trailer`; bind the video’s autoplay behavior to it, and retain a visible play button/fallback poster when autoplay is unavailable.
- [ ] Re-run the focused trailer spec; expect PASS.
- [ ] Commit with `git add src/app/core/components/trailer && git commit -m "test: define trailer hero behavior"`.

### Task 2: Implement the booking-dock hero

**Files:**
- Modify: `src/app/core/components/trailer/trailer.html`
- Modify: `src/app/core/components/trailer/trailer.css`
- Modify: `src/app/core/components/trailer/trailer.ts`

- [ ] Replace the standalone trailer heading with a hero header that contains the eyebrow, one H1, and a concise cultural-experience explanation.
- [ ] Keep the MP4 prominent in a 16:9 frame. It must autoplay muted and loop on supported browsers; it must never autoplay sound.
- [ ] Add a booking dock directly below the frame with these items: `15-minute experience`, `Beside the Golden Gate`, `Adult €13`, `Child €9 · ages 8–14`, and a localized `/booking` link using `data-testid="hero-booking-cta"`.
- [ ] Add compact Tripadvisor proof only if an existing asset/copy supports it; do not create a review count, rating, ranking, or badge.
- [ ] Write responsive CSS: the dock is one row on desktop, two fact columns plus a full-width CTA on mobile, and all critical text meets strong contrast against its background.
- [ ] Run the focused trailer spec; expect PASS. Commit with `git add src/app/core/components/trailer && git commit -m "feat: make trailer the booking hero"`.

### Task 3: Localize conversion copy and keyword strip

**Files:**
- Modify: `src/assets/i18n/en.json`
- Modify: `src/assets/i18n/hr.json`
- Modify: `src/app/core/components/highlights/highlights.html`
- Modify: `src/app/core/components/highlights/highlights.css`

- [ ] Add matching `home.heroConversion` keys to EN and HR: headline, short explanation, duration, location, adult price, child price, booking CTA, and child age wording.
- [ ] Replace generic SEO phrases in `home.marquee.items` with the localized equivalents of: `Historically grounded reconstruction`, `The Palace in 305 AD`, `15-minute cultural experience`, `8 languages`, `In the heart of Split`, and `See beyond the ruins`.
- [ ] Keep the duplicated marquee track for seamless animation, improve its contrast, and stop its animation with `prefers-reduced-motion`.
- [ ] Run `npm test -- --watch=false --include='src/app/core/components/highlights/highlights.spec.ts'`; expect PASS. Commit with `git add src/assets/i18n src/app/core/components/highlights && git commit -m "feat: add homepage conversion copy"`.

### Task 4: Simplify the homepage journey

**Files:**
- Modify: `src/app/features/landing-page/landing-page.html`
- Modify: `src/app/features/landing-page/landing-page.ts`
- Modify: `src/app/core/components/experience/experience.html`
- Modify: `src/app/core/components/experience/experience.css`

- [ ] Remove `app-intro-reveal`, `app-hero`, the duplicate trailer placement, `app-blog-invite`, and `app-partners` from `LandingPage` imports and template. Place the single trailer hero immediately after the header, then highlights.
- [ ] Change the experience heading/copy to the first value section: `See beyond the ruins`; use `assets/images/vr/great-hall.jpg` as a low-contrast background layer.
- [ ] Retain one visitor image and the 15/305 facts; remove the second portrait and wide panorama image from the experience bento.
- [ ] Increase body copy to at least `1rem`, use a minimum `rgba(26, 24, 20, 0.82)` text color on light backgrounds, and retain one consistent booking CTA.
- [ ] Run `npm test -- --watch=false --include='src/app/features/landing-page/landing-page.spec.ts,src/app/core/components/experience/experience.spec.ts'`; expect PASS. Commit with `git add src/app/features/landing-page src/app/core/components/experience && git commit -m "feat: simplify homepage booking journey"`.

### Task 5: Verify V1 end-to-end

**Files:**
- Modify: `docs/superpowers/plans/2026-08-11-homepage-conversion-hero.md`

- [ ] Run `npm test -- --watch=false --include='src/app/core/components/trailer/trailer.spec.ts,src/app/core/components/highlights/highlights.spec.ts,src/app/core/components/experience/experience.spec.ts,src/app/features/landing-page/landing-page.spec.ts'`; expect all selected tests PASS.
- [ ] Run `npm run build`; expect Angular build, sitemap generation, and build verification with no errors.
- [ ] Run `npm start -- --host 127.0.0.1` and inspect desktop and mobile: visible mute-safe video, readable booking dock, accurate price/age wording, a dominant booking CTA, and a static reduced-motion variant.
- [ ] Record the completed verification in this plan and commit it with `git add docs/superpowers/plans/2026-08-11-homepage-conversion-hero.md && git commit -m "docs: record homepage hero verification"`.
