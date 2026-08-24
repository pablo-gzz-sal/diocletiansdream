# Accessibility and Author Title Corrections Design

## Goal

Correct the two invalid ARIA usages reported by PageSpeed Insights and replace Josip Belamarić's displayed title from Academician/Akademik to Professor/Profesor in English and Croatian.

## Preservation contract

- Do not change the Vimeo hero, autoplay timing, poster, booking controls, or animation.
- Do not change routes, forms, booking behavior, analytics configuration, consent behavior, or TuriTop integration.
- Do not change the `/dd-thankyou/` component or `src/assets/vendor/turitop-thankyou.js`.
- Preserve all SEO architecture: canonicals, hreflang, robots directives, sitemap generation, JSON-LD structure, and prerendering.
- The requested English meta-description wording will change from “Academician” to “Professor”; its structure and indexing behavior remain unchanged.

## Accessibility corrections

### Highlights marquee

Remove `aria-label="highlights"` from the generic `.marquee-wrap` `<div>`. The marquee remains decorative and its track remains `aria-hidden="true"`. No CSS class, animation, dimensions, or rendered text changes.

### Review stars

Keep the meaningful `aria-label="5 out of 5 stars"` and add `role="img"` to `.reviews-stars`. This gives the generic container a permitted semantic role while its five decorative SVG children remain hidden from assistive technology.

## Author-title copy corrections

Update every visitor-visible and SEO occurrence in the two locale files:

- English: `Academician` / `Academician Josip Belamarić` → `Professor` / `Professor Josip Belamarić`.
- Croatian standalone honorific: `Akademik` → `Profesor`.
- Croatian sentence copy: `akademik Josip Belamarić` → `profesor Josip Belamarić`.

The person's name, structured-data identity, job title, and all surrounding historical claims remain unchanged.

## Testing and verification

- Add component regression tests proving the highlights wrapper has no invalid `aria-label` and the review stars expose `role="img"` with the rating label.
- Add a locale-content regression test covering all English and Croatian title occurrences, including the English SEO meta description.
- Run the new tests in their failing state before implementation, then rerun them after the minimal changes.
- Run the full Angular suite and all existing Node contract tests.
- Run the production build and require sitemap/indexability verification to pass.
- Inspect the final diff to confirm that no hero, SEO infrastructure, booking, analytics, or thank-you files changed.
