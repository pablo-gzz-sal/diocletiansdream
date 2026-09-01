# Conversion Interaction Tracking Design

## Goal

Add focused GA4 interaction tracking to the live redesign without changing navigation, visual presentation, consent behaviour, TuriTop integration, or the existing purchase conversion on `/dd-thankyou/`.

## Scope

Track only four agreed interaction groups:

1. Booking calls to action.
2. Booking widget visibility.
3. Telephone and email contact clicks.
4. English/Croatian language switches.

Ordinary navigation, social links, FAQ controls, galleries, cookie controls, and other interface interactions remain untracked.

## Architecture

### Analytics service

Create one browser-safe Angular service responsible for sending custom events through the existing global Google tag. The service will:

- call the existing `window.gtag('event', ...)` API;
- preserve the site's existing Google Consent Mode configuration;
- add the current page path and site language to every tracked event;
- accept only non-personal, descriptive parameters;
- return safely when rendering on the server, when `gtag` is unavailable, or when an analytics blocker prevents Google from loading;
- never delay, cancel, or replace the visitor's original click or navigation.

No new Google Tag Manager container or additional Google tag will be installed.

### Explicit interaction annotations

Only agreed conversion-related controls will receive analytics annotations. A central interaction tracker will read those annotations from bubbled click events and send the matching GA4 event. This avoids adding separate click methods to many components and makes the tracked scope visible in the templates.

The tracker will ignore elements without an explicit analytics annotation, even if they are visually styled as buttons.

### Booking widget visibility

The Booking component will observe the existing `#booking-widget` section after browser rendering. It will send `booking_widget_view` once per Booking component visit when the section becomes meaningfully visible in the viewport. The observer will disconnect after the first event and on component destruction.

The observer will not inspect, alter, or communicate with the TuriTop iframe.

## Event Contract

### `book_now_click`

Sent from every user-facing control whose primary purpose is taking the visitor toward booking.

Parameters:

- `cta_location`: stable placement identifier such as `homepage_hero`, `mobile_header`, `experience_closing`, or `blog_sidebar`;
- `page_path`: current pathname;
- `site_language`: `en` or `hr`.

### `booking_widget_view`

Sent once when the existing widget section becomes visible.

Parameters:

- `cta_location`: `booking_widget`;
- `page_path`;
- `site_language`.

### `contact_click`

Sent from the agreed telephone and email links.

Parameters:

- `contact_method`: `phone` or `email`;
- `cta_location`: stable placement identifier;
- `page_path`;
- `site_language`.

The telephone number, email address, link text, and visitor-provided information will not be sent to GA4.

### `language_switch`

Sent immediately before the existing language navigation proceeds.

Parameters:

- `from_language`: `en` or `hr`;
- `to_language`: `en` or `hr`;
- `cta_location`: `desktop_header` or `mobile_menu`;
- `page_path`;
- `site_language`.

## Purchase Tracking Protection

The following files and behaviour are outside the implementation scope and must remain functionally unchanged:

- `src/app/features/thank-you/thank-you.ts`;
- `src/assets/vendor/turitop-thankyou.js`;
- the existing `purchase` event and `transaction_id` handling;
- the existing Google Ads purchase conversion;
- the `/dd-thankyou/` route and query-string booking guard;
- TuriTop script loading and widget configuration.

Regression verification will confirm that the thank-you implementation and vendor purchase script remain unchanged by the tracking work.

## Error Handling and Privacy

- Tracking failures are silent and must never break a link, button, language switch, or booking flow.
- The existing consent defaults and consent updates remain authoritative.
- No personal data is included in event parameters.
- Event names and parameter values are stable lowercase identifiers so reports remain consistent across releases.

## Testing

Implementation follows test-driven development:

1. Add failing unit tests for safe event delivery, automatic page/language context, and unavailable browser/Google-tag conditions.
2. Add failing interaction tests proving only annotated controls emit events and original navigation handlers still run.
3. Add failing tests for the four event payloads and one-time widget visibility.
4. Add a static coverage test that finds agreed booking CTA, telephone, email, and language controls without tracking annotations.
5. Implement the minimum code required for those tests to pass.
6. Run the relevant Angular tests, static tracking test, complete production build, sitemap/static-output verification, and inspect the final diff.

## Delivery

After verification, package the production browser output as `site.zip` using the same deployable directory structure expected by SiteGround. Confirm the archive contains the site at its root, includes `/dd-thankyou/`, and excludes source files, Git metadata, and prior archives.
