# Mobile Hero Visibility and Scroll Performance — Design

## Goal

Restore the missing Experience, Visit, and About page titles on mobile; prevent the homepage hero title and booking information dock from competing for space; and remove the remaining sources of lag while scrolling inner pages.

## Confirmed Causes

### Missing H1 titles

The Experience, Visit, and About H1 text is rendered inside spans that begin with `opacity-0` and rely on a CSS reveal animation to become visible. Mobile performance mode correctly disables animations, but it does not override that nested starting opacity. The H1 elements therefore occupy space while their text remains invisible. English and Croatian routes share these templates and are affected by the same cause.

### Crowded homepage hero

The homepage title block already has a timed visibility state, `heroCopyVisible`, while the mobile booking dock is always displayed. During the opening title phase, both occupy the hero simultaneously.

### Inner-page scrolling lag

Mobile animation and filter effects are already disabled, and reveal directives correctly skip GSAP/ScrollTrigger initialization. The remaining avoidable scroll costs are:

- Four fixed body background layers through `background-attachment: fixed`, which require repainting during mobile scroll.
- A global header scroll handler running for every scroll event.
- The complete fixed mobile-menu overlay remaining rendered while the menu is closed.

Embedded Vimeo and Google Maps frames are already lazy-loaded and will remain unchanged.

## Approved Behavior

### Secondary-page titles

- Experience, Visit, and About H1 text is always fully visible on viewports below 768 px and when reduced motion is requested.
- Desktop reveal animations remain unchanged.
- The shared templates continue serving both languages; no duplicate headings are introduced.

### Homepage hero title and booking dock

- Desktop behavior remains unchanged.
- On mobile, the booking dock is hidden while `heroCopyVisible` is true.
- The dock becomes visible when the hero title block becomes hidden.
- If the title returns near the end of the video loop, the dock hides again.
- The title block's existing primary booking CTA remains available during the title phase.
- Reduced-motion or failed-autoplay fallback behavior keeps the title and its CTA available; the dock is not required as a duplicate.

### Mobile scrolling

- Set the body background attachment to `scroll` below 768 px while preserving the same background artwork.
- Replace per-event header updates with a passive, animation-frame-throttled scroll listener and clean it up on destroy.
- Render the fixed mobile-menu layer only while the menu is open. Its existing cream-panel appearance and controls remain unchanged.
- Preserve the fixed sticky header itself.

## Testing and Verification

- Add regression coverage for visible mobile/reduced-motion hero title spans.
- Add Trailer component tests proving that the mobile dock visibility state is inverse to `heroCopyVisible` without changing desktop semantics.
- Add Header tests proving the menu layer is absent while closed and present while open.
- Add a static performance contract for mobile `background-attachment: scroll` and throttled header listener cleanup.
- Run the full Angular test suite and production build.
- Inspect English and Croatian Experience, Visit, and About routes at 320 px and 390 px.
- Verify homepage title/dock sequencing at mobile width.
- Confirm inner pages retain only the sticky header as a persistent fixed layer while the menu is closed.
- Republish to `https://pearly-dory-g7y4.here.now/` and verify the live build.
