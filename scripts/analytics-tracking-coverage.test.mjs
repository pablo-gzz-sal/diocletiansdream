import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const bookingBinding = `[href]="('/booking' | locPath) + '/#booking-widget'"`;

const bookingLocations = new Map([
  ['src/app/core/components/experience/experience.html', ['home_experience']],
  [
    'src/app/core/components/header/header.html',
    ['desktop_header', 'mobile_header', 'mobile_menu'],
  ],
  ['src/app/core/components/hero/hero.html', ['home_intro_primary', 'home_intro_card']],
  [
    'src/app/core/components/trailer/trailer.html',
    ['homepage_hero', 'homepage_booking_dock'],
  ],
  ['src/app/core/components/visit/visit.html', ['home_visit']],
  ['src/app/features/about/about.html', ['about_intro']],
  ['src/app/features/booking/booking.html', ['booking_hero']],
  [
    'src/app/features/blog/blog-post-page/blog-post-page.html',
    ['blog_post_footer', 'blog_post_sidebar'],
  ],
  [
    'src/app/features/contact/contact.html',
    [
      'visit_hero',
      'visit_location',
      'visit_individual',
      'visit_hours',
      'visit_seasonal',
      'visit_booking_panel',
      'visit_closing',
    ],
  ],
  [
    'src/app/features/experience/experience.html',
    [
      'experience_intro',
      'experience_trailer',
      'experience_reconstruction',
      'experience_detail',
      'experience_closing',
    ],
  ],
  ['src/app/features/partners/partners-page.html', ['partners_closing']],
  ['src/app/shared/components/cta-block/cta-block.html', ['blog_index_cta']],
]);

const contactExpectations = new Map([
  [
    'src/app/features/contact/contact.html',
    [
      ['group_email_button', 'email'],
      ['group_email_link', 'email'],
      ['accessibility_email', 'email'],
      ['visit_hours_email', 'email'],
      ['seasonal_email', 'email'],
    ],
  ],
  [
    'src/app/core/components/footer/footer.html',
    [
      ['footer_contact', 'email'],
      ['footer_contact', 'phone'],
      ['footer_contact', 'phone'],
    ],
  ],
]);

const source = (relativePath) => readFileSync(resolve(projectRoot, relativePath), 'utf8');
const openingTags = (content, tagName) => content.match(new RegExp(`<${tagName}\\b[\\s\\S]*?>`, 'g')) ?? [];
const attribute = (tag, name) => tag.match(new RegExp(`${name}="([^"]+)"`))?.[1];

test('every agreed Book Now CTA has focused GA4 tracking', () => {
  for (const [relativePath, expectedLocations] of bookingLocations) {
    const tags = openingTags(source(relativePath), 'a').filter((tag) => tag.includes(bookingBinding));

    assert.equal(tags.length, expectedLocations.length, `${relativePath} booking CTA count changed`);
    assert.deepEqual(
      tags.map((tag) => attribute(tag, 'data-analytics-event')),
      expectedLocations.map(() => 'book_now_click'),
      `${relativePath} must track only book_now_click`,
    );
    assert.deepEqual(
      tags.map((tag) => attribute(tag, 'data-analytics-location')),
      expectedLocations,
      `${relativePath} must keep stable CTA locations`,
    );
  }
});

test('every agreed email and telephone link has privacy-safe contact tracking', () => {
  for (const [relativePath, expected] of contactExpectations) {
    const tags = openingTags(source(relativePath), 'a').filter((tag) =>
      /href="(?:mailto:|tel:)/.test(tag),
    );

    assert.equal(tags.length, expected.length, `${relativePath} contact-link count changed`);
    assert.deepEqual(
      tags.map((tag) => [
        attribute(tag, 'data-analytics-location'),
        attribute(tag, 'data-contact-method'),
      ]),
      expected,
      `${relativePath} must expose only method and stable location`,
    );
    assert.ok(
      tags.every((tag) => attribute(tag, 'data-analytics-event') === 'contact_click'),
      `${relativePath} must use contact_click`,
    );
  }
});

test('the four language controls track only real EN/HR switches', () => {
  const tags = openingTags(source('src/app/core/components/header/header.html'), 'button').filter(
    (tag) => tag.includes('(click)="switchTo('),
  );

  assert.equal(tags.length, 4);
  assert.deepEqual(
    tags.map((tag) => [
      attribute(tag, 'data-analytics-event'),
      attribute(tag, 'data-analytics-location'),
      attribute(tag, 'data-to-language'),
    ]),
    [
      ['language_switch', 'desktop_header', 'en'],
      ['language_switch', 'desktop_header', 'hr'],
      ['language_switch', 'mobile_menu', 'en'],
      ['language_switch', 'mobile_menu', 'hr'],
    ],
  );
  assert.ok(tags.every((tag) => tag.includes('[attr.data-from-language]="currentLang()"')));
});

test('templates contain no unapproved analytics click event names', () => {
  const allowed = new Set(['book_now_click', 'contact_click', 'language_switch']);
  const templatePaths = [...new Set([...bookingLocations.keys(), ...contactExpectations.keys()])];

  for (const relativePath of templatePaths) {
    const events = [...source(relativePath).matchAll(/data-analytics-event="([^"]+)"/g)].map(
      (match) => match[1],
    );
    assert.ok(events.every((eventName) => allowed.has(eventName)), relativePath);
  }
});
