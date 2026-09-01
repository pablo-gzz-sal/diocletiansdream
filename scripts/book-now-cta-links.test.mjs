import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const localizedBookingWidgetBinding = `[href]="('/booking' | locPath) + '/#booking-widget'"`;
const englishBookingWidgetUrl = 'https://diocletiansdream.com/booking/#booking-widget';
const croatianBookingWidgetPath = '/hr/rezervacija/#booking-widget';
const bookingRouterLink = `[routerLink]="'/booking' | locPath"`;

const bookNowCtas = new Map([
  ['src/app/core/components/experience/experience.html', 1],
  ['src/app/core/components/header/header.html', 3],
  ['src/app/core/components/hero/hero.html', 2],
  ['src/app/core/components/trailer/trailer.html', 2],
  ['src/app/core/components/visit/visit.html', 1],
  ['src/app/features/about/about.html', 1],
  ['src/app/features/booking/booking.html', 1],
  ['src/app/features/blog/blog-post-page/blog-post-page.html', 2],
  ['src/app/features/contact/contact.html', 7],
  ['src/app/features/experience/experience.html', 5],
  ['src/app/features/partners/partners-page.html', 1],
  ['src/app/shared/components/cta-block/cta-block.html', 1],
]);

const source = (relativePath) => readFileSync(resolve(projectRoot, relativePath), 'utf8');
const occurrences = (content, value) => content.split(value).length - 1;

test('every Book Now CTA uses the locale-aware booking widget destination', () => {
  for (const [relativePath, expectedCount] of bookNowCtas) {
    const template = source(relativePath);

    assert.equal(
      occurrences(template, localizedBookingWidgetBinding),
      expectedCount,
      `${relativePath} must retain every Book Now CTA with a locale-aware booking-widget destination`,
    );
    assert.equal(
      occurrences(template, bookingRouterLink),
      0,
      `${relativePath} must not send Book Now CTAs through the /booking route`,
    );
    assert.equal(occurrences(template, englishBookingWidgetUrl), 0);
    assert.equal(occurrences(template, croatianBookingWidgetPath), 0);
  }
});

test('the footer Booking navigation link remains on the booking page', () => {
  const footer = source('src/app/core/components/footer/footer.html');

  assert.equal(occurrences(footer, bookingRouterLink), 1);
  assert.equal(occurrences(footer, localizedBookingWidgetBinding), 0);
});
