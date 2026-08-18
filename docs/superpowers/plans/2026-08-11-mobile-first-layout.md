# Mobile-first layout implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the redesigned site fit narrow mobile viewports, add a sticky-header booking action, and make the homepage Vimeo hero start immediately and loop reliably.

**Architecture:** Keep the existing Angular standalone components and vanilla component CSS. Fix intrinsic sizing at the component that creates it, add a small set of global safeguards for unpredictable WordPress HTML, and keep playback recovery inside the trailer component.

**Tech Stack:** Angular 20, TypeScript, component CSS, Tailwind utility classes already compiled by the project, Jasmine/Karma, Vimeo Player API.

---

### Task 1: Header mobile contract

**Files:**
- Modify: `src/app/core/components/header/header.spec.ts`
- Modify: `src/app/core/components/header/header.html`
- Modify: `src/app/core/components/header/header.css`

- [ ] Add failing assertions for a mobile booking link and three semantic hamburger strokes.
- [ ] Run the header spec and confirm the new assertions fail.
- [ ] Add the scroll-conditioned gold booking link between logo and menu button.
- [ ] Replace utility-dependent stroke sizing with stable component classes and preserve the open/close animation.
- [ ] Run the header spec and confirm it passes.

### Task 2: Immediate and resilient hero playback

**Files:**
- Modify: `src/app/core/components/trailer/trailer.spec.ts`
- Modify: `src/app/core/components/trailer/trailer.ts`
- Modify: `src/app/core/components/trailer/trailer.css`

- [ ] Replace the delay test with an immediate-ready playback assertion.
- [ ] Add a failing test proving an unexpected pause during the clean segment resumes playback while visible.
- [ ] Run the trailer spec and confirm both behaviors fail against the current implementation.
- [ ] Remove the opening timer and start playback immediately after seek/mute preparation.
- [ ] Recover any unintended visible autoplay pause, while preserving the intentional out-of-viewport pause.
- [ ] Set the mobile hero to dynamic viewport height and compact its vertical content/dock spacing.
- [ ] Run the trailer spec and confirm it passes.

### Task 3: Tripadvisor mobile containment

**Files:**
- Modify: `src/app/core/components/experience/experience.spec.ts`
- Modify: `src/app/core/components/experience/experience.css`

- [ ] Add a failing structural assertion for the mobile-safe experience grid hook.
- [ ] Run the experience spec and confirm the assertion fails.
- [ ] Add `min-width: 0` boundaries and replace the mobile 4:3-plus-min-height conflict with a width-driven portrait ratio.
- [ ] Make the award grid and logo shrink safely on the narrowest supported width.
- [ ] Run the experience spec and confirm it passes.

### Task 4: Site-wide and WordPress overflow safeguards

**Files:**
- Modify: `src/styles.css`
- Verify: `src/app/features/landing-page/landing-page.css`
- Verify: `src/app/features/experience/experience.css`
- Verify: `src/app/features/contact/contact.css`
- Verify: `src/app/features/about/about.css`
- Verify: `src/app/features/booking/booking.css`
- Verify: `src/app/features/blog/blog-list-page/blog-list-page.css`
- Verify: `src/app/features/blog/blog-post-page/blog-post-page.css`

- [ ] Add shared `min-width: 0`, `max-width: 100%`, wrapping, and horizontal-scroll rules for meaningful media and rich-content elements.
- [ ] Keep tables and preformatted content readable through contained horizontal scrolling rather than cropping.
- [ ] Inspect each listed stylesheet and principal route, adding a component-specific rule only when the audit identifies a concrete overflowing element.

### Task 5: Verification and knowledge handoff

**Files:**
- Modify: `../web-redesign.md`

- [ ] Audit Home, Experience, Visit, About, Booking, Blog, legal pages, and representative EN/HR posts at narrow mobile widths.
- [ ] Run the focused header, trailer, and experience tests with zero failures.
- [ ] Run a fresh production build and verify generated output.
- [ ] Run `git diff --check`.
- [ ] Record the mobile hero, sticky header, overflow, and playback rules in the redesign knowledge file.
- [ ] Do not commit, push, merge, publish, or deploy.
