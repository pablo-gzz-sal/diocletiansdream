# Homepage Conversion Hero — V1 Design

## Scope

Redesign the homepage in `diocletiansdream-redesign/` to make it a clear booking landing page while preserving its cultural, cinematic character. This V1 focuses on the hero and the order/readability of the homepage sections beneath it. It does not change the booking system, pricing logic, or live website.

## Chosen direction: Option 1 — trailer with booking dock

The hero is a self-contained decision surface rather than a decorative introduction.

1. The existing trailer becomes the dominant visual element. It starts automatically, muted, inline, and looping. Autoplay must remain muted because modern browsers otherwise block it. The visitor can explicitly unmute or use video controls.
2. The image previously used as the hero background is removed from the hero. It will be reused, with a dark/soft overlay, as a background image in the first value section below the hero.
3. A bottom booking dock overlays or sits directly beneath the video without obscuring important imagery. It has one primary action: **Book your experience**.
4. A narrow keyword scroller follows the dock. It is informative, quiet, and may not compete with the booking CTA.

## Hero content

### Primary message

- Eyebrow: `Diocletian's Palace VR experience in Split`
- H1: `See Diocletian's Palace as it was in 305 AD`
- Supporting line: A short, readable explanation that frames the attraction as a carefully reconstructed cultural experience—not a gadget or game.

### Booking dock

The dock presents only decision-making information:

- `15-minute experience`
- `Beside the Golden Gate`
- `Adult €13`
- `Child €9 (ages 8–14)`
- Primary CTA: `Book your experience`

The booking destination remains the current localized `/booking` route.

### Trust proof

Use a compact Tripadvisor recognition/review area in the hero only if the existing, valid asset and wording are available. Do not invent current review totals, star ratings, rankings, or awards. Any existing 2022/2023 Travellers’ Choice proof can be shown with its date.

### Keyword scroller

Use source-grounded phrases with calm motion, for example:

`Historically grounded reconstruction` · `The Palace in 305 AD` · `15-minute cultural experience` · `8 languages` · `In the heart of Split` · `See beyond the ruins`

Avoid absolute claims such as “perfectly accurate.” Preserve reduced-motion support: the strip becomes static if the visitor prefers reduced motion.

## Homepage order after the hero

1. **See beyond the ruins:** reuse the present hero image as a restrained background. Explain the transformation from present-day ruins to the living ancient Palace.
2. **Why it is credible:** concise 2026 remake / historical-and-artistic-care section, including approved attribution to Academician Josip Belamarić when the wording is verified in the source copy.
3. **Plan your visit:** readable practical facts and one repeated booking CTA.
4. **Visitor proof:** a focused testimonial/reviews module, with only verified social proof.
5. **Location and FAQs:** retain their practical role, improve contrast, and keep a booking CTA nearby.

Remove from the V1 homepage flow:

- The redundant trailer section, because the trailer is now the hero.
- The large grid of small keyword tiles.
- The current blog invite, recommended external activities, and duplicated project-story material.
- Decorative images that do not either prove the experience or help a visitor decide to book.

## Visual and interaction principles

- Improve all body copy, labels, and buttons to a readable size and contrast ratio. No pale-on-cream critical copy.
- Use a disciplined number of images: the trailer, one heritage/reconstruction background, one credibility/visitor image if needed, and the map.
- The hero uses the existing purple/gold identity in the CTA and fine detail; it must not cover the trailer with multiple floating cards.
- Keep a single primary CTA label and destination throughout: `Book your experience`.
- On mobile, place the H1 and short explanation above the video; stack the booking facts below the video and keep the CTA full-width and easy to tap.
- Respect `prefers-reduced-motion`; do not autoplay in that mode, and keep the keyword strip static.

## Backup direction: Option 2

If V1 feels too structured, keep the same content but move the visit facts into two translucent side cards over a full-bleed trailer. This is more atmospheric but covers more film imagery and gives less immediate booking clarity. It is intentionally not part of V1.

## Validation

- Confirm the video autoplays muted and remains visible, with a usable explicit control.
- Confirm adult and child pricing, age wording, duration, location, and booking route are correct in English and Croatian.
- Check desktop and mobile readability, keyboard focus, and reduced-motion behavior.
- Run the Angular build and inspect the local homepage before presentation.
