# Native Vimeo Hero Loop Design

## Goal

Make the homepage hero loop indefinitely without freezing while preserving the poster/title transition and the existing Vimeo URL.

## Architecture

The newly replaced Vimeo asset already contains only the clean hero segment. Vimeo therefore becomes the sole playback-loop owner through `loop=1`; Angular must never seek backward or maintain hard-coded start/end trim timestamps.

Angular observes Vimeo playback only for presentation. It reads the current asset duration from the player, fades to the ancient poster/title near the natural ending, and reveals the video again after the native loop reports new motion near the beginning. Unexpected pauses while the hero is visible still request `play()`, but the application does not alter playback position.

## Behaviour

- Keep video ID `1217274878` and the existing URL.
- Start muted playback immediately after Vimeo is ready.
- Use Vimeo `loop=1` and `autopause=0`.
- Never call `setCurrentTime()` during initialisation or looping.
- Read duration with `getDuration()` so future Vimeo replacements do not require code timing changes.
- Show the poster/title during the last 0.8 seconds of the clean asset.
- Reveal the moving video again after native looping reports at least 0.15 seconds of the new cycle.
- Pause when the hero leaves the viewport and resume when it returns.
- Preserve reduced-motion fallback and existing mobile full-cover geometry.

## Verification

- Unit tests prove that the URL enables native looping and no test expects application seeking.
- Unit tests prove duration-driven closing transition and native-loop reveal.
- A real-browser observation covers more than one complete Vimeo cycle and confirms advancing media time after each restart.
- Focused component tests and the full production prerender build must pass.

## Scope and safety

Work remains local in `diocletiansdream-redesign/`. No commit, push, merge, preview publication, production-folder copy, or SiteGround deployment is authorised.
