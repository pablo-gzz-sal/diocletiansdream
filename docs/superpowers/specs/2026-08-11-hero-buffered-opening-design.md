# Hero Buffered Opening Design

## Goal

Give the homepage a deliberate, readable opening beat while Vimeo buffers, then transition smoothly into the existing clean-loop trailer without changing the hero layout or conversion elements.

## Approved behaviour

- Render `diocletians-bedchamber.jpg` immediately as the full-viewport ancient poster.
- Keep the logo, navigation, headline, subtitle, primary booking CTA, Tripadvisor line, booking dock, and keyword scroller visible during loading and the opening hold.
- After Vimeo is ready, seek to 5 seconds, mute it, hold the poster for 1 second, then start playback and crossfade the video above the poster.
- Keep the headline visible for the first 2.5 seconds of moving video, then use the existing cinematic fade behaviour. Bring it back before the clean loop resets.
- Preserve reduced-motion behaviour: the poster remains the stable visual and playback only starts when the visitor explicitly requests it.
- Preserve the visibility-aware looping and pause/resume behaviour already implemented.
- Render the English authority heading as three explicit lines: `A reconstruction`, `grounded in`, `scholarship`. Croatian keeps its existing translated heading flow.

## Failure handling

If Vimeo is slow or fails, the poster and all hero content remain visible and usable indefinitely. Delayed-start timers must be cancelled when the component is destroyed or leaves the viewport.

## Verification

- Unit-test the 2.5-second delayed start and poster/video state.
- Unit-test the explicit English authority line.
- Inspect the initial hero and post-transition hero in the local browser.
- Run the production prerender build and build verification scripts.
