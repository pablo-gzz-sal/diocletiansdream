# Hero Buffered Opening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a polished 1-second poster-led Vimeo buffer period and guarantee the English historical-authority heading line breaks.

**Architecture:** The trailer component owns a small playback-intro state machine: poster visible, player ready/holding, and video revealed. The existing iframe remains eagerly loaded behind a local still, and its current trim-loop and viewport lifecycle continue after playback begins. The authority template uses translated line keys so English wrapping is structural rather than dependent on viewport width.

**Tech Stack:** Angular standalone components, `@vimeo/player`, ngx-translate, CSS transitions, Jasmine/Karma.

---

### Task 1: Lock the opening and heading behaviour with tests

**Files:**
- Modify: `src/app/core/components/trailer/trailer.spec.ts`
- Create: `src/app/core/components/historical-authority/historical-authority.spec.ts`

- [x] **Step 1: Write a fake-clock trailer test** proving `onPlayerReady()` seeks and mutes immediately, does not call `play()` before 1 second, and reveals/plays the video at 1 second.
- [x] **Step 2: Write an authority rendering test** proving the English first line is exactly `A reconstruction` and is marked as non-breaking.
- [x] **Step 3: Run the focused specs** and confirm they fail against the current implementation.

### Task 2: Implement the buffered poster-to-video handoff

**Files:**
- Modify: `src/app/core/components/trailer/trailer.ts`
- Modify: `src/app/core/components/trailer/trailer.html`
- Modify: `src/app/core/components/trailer/trailer.css`

- [x] **Step 1: Add intro state and timer cleanup** with a 1-second hold and a `videoRevealed` view state.
- [x] **Step 2: Change player-ready behaviour** to seek/mute immediately, then start only after the hold while still visible.
- [x] **Step 3: Add the local ancient poster layer** using `diocletians-bedchamber.jpg`, with the Vimeo iframe crossfading above it.
- [x] **Step 4: Shorten moving-video headline time** from 5 seconds to 2.5 seconds while retaining the end-of-loop return.
- [x] **Step 5: Preserve fallback behaviour** so a failed or slow player leaves the fully usable poster hero in place.

### Task 3: Guarantee the English authority line

**Files:**
- Modify: `src/app/core/components/historical-authority/historical-authority.html`
- Modify: `src/app/core/components/historical-authority/historical-authority.css`
- Modify: `src/assets/i18n/en.json`
- Modify: `src/assets/i18n/hr.json`

- [x] **Step 1: Add translated title-line keys** for English and Croatian.
- [x] **Step 2: Render explicit line spans** and apply non-breaking treatment to the English first line on desktop, with a safe mobile override.

### Task 4: Verify and document

**Files:**
- Modify: `../web-redesign.md`

- [x] **Step 1: Run focused Angular tests** and confirm zero failures.
- [x] **Step 2: Inspect the local hero before and after the delayed transition** at desktop and mobile widths.
- [x] **Step 3: Run `npm run build`** and confirm all static routes, sitemap entries, and blog posts verify.
- [x] **Step 4: Record the approved opening behaviour** in the redesign knowledge file.
