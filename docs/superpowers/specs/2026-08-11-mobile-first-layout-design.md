# Mobile-first layout and hero playback design

## Scope

This pass makes the redesigned site reliable on phones, with the homepage hero, shared header, homepage Tripadvisor recognition, every marketing page, and imported blog posts included. Desktop presentation remains unchanged.

## Mobile hero

- On screens up to 640px, the homepage trailer occupies exactly the dynamic viewport height (`100dvh`) with safe fallbacks.
- The headline, primary action, trust line, and conversion dock use a compact vertical composition that fits inside the viewport instead of increasing the section height.
- Vimeo starts immediately after the player is ready and positioned at the clean 5-second opening. The poster remains visible only while the player is loading.
- The clean segment continues looping from 5s to 46.2s. A visible, autoplay-enabled hero must recover from `pause`, `ended`, or trim-seek events; scrolling it out of view remains the only intentional automatic pause.

## Mobile sticky header

- The top-of-hero header retains the white logo and hamburger without an extra CTA.
- After the existing sticky threshold, the light header becomes a stable three-column layout: sticky logo, compact gold `BOOK NOW` action, and hamburger.
- Hamburger strokes have equal fixed dimensions and render as three straight lines. The existing close animation remains.

## Width containment

- Responsive layouts shrink at their real component boundaries rather than relying only on page-level clipping.
- The homepage Tripadvisor figure removes the conflicting mobile minimum-height/aspect-ratio combination and uses a portrait ratio that is derived from available width.
- Shared grid children, cards, images, iframes, SVGs, WordPress figures, galleries, tables, preformatted text, and long links receive explicit shrink or scroll behavior.
- Decorative elements may be clipped by their owning section, but meaningful content must stay fully inside the viewport.

## Verification

- Add focused component regression tests for the mobile header CTA, semantic hamburger hooks, immediate trailer playback, unexpected visible-player pause recovery, and responsive Tripadvisor structure.
- Inspect Home, Experience, Visit, About, Booking, Blog, legal pages, and representative English and Croatian posts at narrow mobile widths.
- Run the focused test suite, production build, and whitespace checks. No commit, push, merge, or deployment is part of this work.
