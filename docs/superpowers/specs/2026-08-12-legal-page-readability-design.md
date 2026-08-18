# Legal Page Readability Design

## Goal

Make the Privacy, Terms, and Cookies pages comfortable to read on desktop and mobile while preserving their legal wording and the rest of the approved redesign.

## Current Problem

Each policy is currently rendered as one very long paragraph inside a translucent card. Section labels are visually indistinguishable from body copy, paragraphs run together, and the narrow, low-contrast presentation makes scanning difficult. The issue is shared by all three pages because they use the same policy-page component and the same flat content pattern.

## Approved Design

### Document structure

- Keep every sentence of the existing legal copy unchanged.
- Convert the flat text into semantic sections using headings, paragraphs, lists, and links where those structures already exist in the source text.
- Do not add a table of contents, summary, accordion, or new legal claims.
- Keep Privacy, Terms, and Cookies as continuous reading pages.

### Shared page presentation

- Preserve the existing site header and footer without visual changes.
- Use the existing cream, ink, purple, and gold design tokens.
- Present the page title as a clear editorial hero with the legal label and last-updated date.
- Use a restrained document surface with subtle border and warm shadow rather than multiple cards.
- Constrain body copy to approximately 65–70 characters per line.
- Give section headings clear serif hierarchy, gold dividers, and generous spacing.
- Style body text, lists, and links for high contrast and comfortable scanning.
- Avoid decorative animation and effects on the legal content.

### Responsive behavior

- Preserve the global 16 px mobile page-edge gutter.
- Keep body text at a comfortable mobile size with generous line height.
- Reduce container padding and heading scale on narrow screens without compressing the reading column.
- Prevent long URLs or legal terms from causing horizontal overflow.
- Desktop retains the same readable line length rather than stretching copy across the viewport.

## Implementation Boundary

- Improve the shared template and stylesheet in `src/app/features/legal/policy-page-component/`.
- Restructure the existing markup in `privacy.html`, `terms.html`, and `cookies.html` without rewriting legal wording.
- Add focused regression coverage for shared legal-page structure, typography hooks, and mobile overflow protection.
- Do not modify routes, SEO canonicals, consent behavior, header, footer, or legal meaning.

## Knowledge Handoff

Update `../dd-live.md` so a new chat knows:

- `diocletiansdream-redesign/` is the active redesign workspace.
- The permanent client-preview URL is `https://pearly-dory-g7y4.here.now/`.
- Work directly in the redesign folder and leave changes unstaged unless the user asks otherwise.
- Run the static mobile regression scripts, the complete Chrome Headless suite, and the production build before publishing.
- Preview the production output at 320 px and 390 px in English and Croatian, checking headings, overflow, mobile menu state, and page-specific behavior.
- Publish with the existing slug using the here.now script, wait for `finalizing...` and an authenticated permanent result, then smoke-test the live build because upload completion alone does not mean the new version is public.
- Preserve the established mobile performance rules: no costly mobile effects, body backgrounds scroll normally, header scroll work remains animation-frame throttled, and the closed mobile menu layer remains absent from the DOM.

## Verification

- Write failing tests before the production changes.
- Run focused legal-page tests after each shared-template and content change.
- Run `npm run test:mobile-gutters`, `npm run test:mobile-headings`, and `npm run test:mobile-performance`.
- Run the full Angular suite and `npm run build`.
- Inspect Privacy, Terms, and Cookies at 320 px, 390 px, and desktop width.
- Confirm readable hierarchy, no horizontal overflow, unchanged header/footer, and unchanged policy wording.
- Publish to the existing `pearly-dory-g7y4` here.now site and verify all three live URLs.
