# Uniform Mobile Page Gutters — Design

## Goal

Use one 16 px page-edge gutter across every mobile page so content remains comfortable to scroll and wide components, especially the Booking calendar, have enough usable width.

## Problem

Mobile page spacing currently comes from several unrelated rules:

- Most feature pages use Tailwind's `px-6`, producing a 24 px edge gutter.
- Shared layout containers use `--dd-page-x`, which resolves to 16 px on mobile.
- Booking sections add 32 px horizontal padding around inner containers that add another 16 px, producing a 48 px edge gutter and narrowing the calendar.

The inconsistency is visible when navigating between pages and materially reduces the Booking widget's width.

## Approved Design

- The mobile page-edge gutter is exactly 16 px on viewports below 768 px.
- A shared page-gutter utility owns that rule for feature-level page wrappers.
- Booking's mobile outer-section horizontal padding is removed so its existing inner container is the sole 16 px gutter owner.
- Component-internal padding (cards, buttons, language controls, calendar contents) is not changed.
- Header-specific floating-shell spacing is not treated as page content spacing.
- Tablet and desktop spacing remains unchanged.

## Coverage

The shared mobile gutter will cover:

- Home page content sections
- Experience
- About
- Booking
- Visit / Contact
- Blog list and blog posts
- Partners
- Privacy, Terms, and Cookies
- Thank-you and not-found pages
- Shared calls-to-action, blog invitations, and footer content

## Implementation Approach

Add a narrowly scoped shared CSS utility for page-level wrappers and apply it only where an existing horizontal padding utility represents the page edge. Avoid a global override of `px-6`, because that class is also used for internal card and control padding.

For Booking, add a mobile-only rule that resets horizontal padding on the outer Booking sections. The existing Booking inner containers will continue to apply `--dd-page-x`, resulting in one 16 px gutter instead of a stacked 48 px gutter.

## Verification

- Add regression tests that require the shared page-gutter class on representative page-level wrappers and verify Booking retains one gutter owner.
- Run the full Angular test suite and production build.
- Inspect representative routes at 320 px and 390 px widths.
- Confirm no horizontal overflow and confirm the Booking card expands to the available page width.
- Republish the verified production build to the existing permanent here.now URL.
