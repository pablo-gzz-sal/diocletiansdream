# Native Vimeo Hero Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unreliable JavaScript-trimmed Vimeo loop with a stable native loop for the newly cleaned Vimeo asset.

**Architecture:** Vimeo owns playback and looping. The Angular component observes duration and time updates only to crossfade the poster/title at the natural boundary; it never seeks.

**Tech Stack:** Angular 20, TypeScript, `@vimeo/player`, Karma/Jasmine

---

### Task 1: Define the native-loop contract with failing tests

**Files:**
- Modify: `src/app/core/components/trailer/trailer.spec.ts`

- [x] Change the player URL expectation to require `loop=1`.
- [x] Extend the player stub with `getDuration()` and return a deterministic clean-video duration.
- [x] Replace hard-coded 5s/46.2s seek tests with assertions that initialisation calls `getDuration()`, mute, and play, but never `setCurrentTime()`.
- [x] Add a test that a time update inside the final 0.8 seconds hides the video and shows the closing copy.
- [x] Add a test that a subsequent native-loop time update above 0.15 seconds reveals the moving video again without seeking.
- [x] Run the focused trailer suite and confirm it fails because the old component still seeks and controls the trim loop.

### Task 2: Implement native looping and observer-only transitions

**Files:**
- Modify: `src/app/core/components/trailer/trailer.ts`

- [x] Remove `loopStartSeconds`, `loopEndSeconds`, seek locks, last-known trim state, `restartCleanLoop()`, and the `seeked` event handler.
- [x] Add a duration field populated by `player.getDuration()` during readiness.
- [x] Add `loop=1` to the Vimeo URL.
- [x] Start muted playback without pausing or seeking.
- [x] Make `onPlayerTimeUpdate()` update only copy/poster visibility from current time and duration.
- [x] Keep viewport pause/resume and unexpected-pause recovery without changing current time.
- [x] Run the focused trailer suite and confirm all tests pass.

### Task 3: Verify the real loop and production output

**Files:**
- Modify: `web-redesign.md` and `../dd-live.md` only if verification changes the durable guidance.

- [x] Restart the local dev server once so the embedded Vimeo player is newly mounted.
- [x] Observe native Vimeo playback and confirm the clean replacement is live, loop-enabled, fully buffered, and advancing normally.
- [ ] Run the combined header/trailer/experience/shared-CTA regression suite before the next review or publication milestone.
- [ ] Run `CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true /usr/local/bin/npm run build` before the next review or publication milestone.
- [x] Update the technical knowledge notes to state that the cleaned Vimeo asset uses native looping and Angular never seeks.
- [x] Do not commit or perform any GitHub, Here Now, production-folder, or SiteGround action.
