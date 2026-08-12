import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return htmlFiles(path);
    }

    return entry.name.endsWith('.html') ? [path] : [];
  });
}

test('shared page gutter is 16 px on mobile and preserves larger breakpoints', () => {
  const css = read('src/styles.css');

  assert.match(css, /\.dd-page-gutter\s*\{[^}]*padding-inline:\s*1rem/s);
  assert.match(
    css,
    /@media\s*\(min-width:\s*768px\)[\s\S]*?\.dd-page-gutter\s*\{[^}]*padding-inline:\s*1\.5rem/s,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.dd-page-gutter\s*\{[^}]*padding-inline:\s*2rem/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.hero-inner,[\s\S]*?\.booking-hero__inner,[\s\S]*?\.map-section__inner\s*\{[^}]*padding-inline:\s*1rem\s*!important/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.dd-site-header\s*>\s*div\s*\{[^}]*padding-inline:\s*1rem\s*!important/s,
  );
});

test('page templates use the shared gutter instead of the legacy pair', () => {
  const offenders = htmlFiles('src/app').filter((path) =>
    read(path).includes('px-6 lg:px-8'),
  );

  assert.deepEqual(offenders, []);
});

test('booking has only its inner 16 px gutter on mobile', () => {
  const css = read('src/app/features/booking/booking.css');

  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.booking-hero,[\s\S]*?\.booking-widget-section,[\s\S]*?\.booking-faq,[\s\S]*?\.map-section\s*\{[^}]*padding-inline:\s*0/s,
  );
});

test('scrolled mobile header is dark with a white hamburger', () => {
  const css = read('src/styles.css');

  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.dd-site-header\.dd-header-solid\s*\{[^}]*background:\s*rgba\(26,\s*24,\s*20,\s*0\.78\)\s*!important/s,
  );
  assert.match(
    css,
    /\.dd-site-header\.dd-header-solid\s+\.dd-mobile-menu-toggle\s*\{[^}]*color:\s*#fff\s*!important/s,
  );
  assert.match(
    css,
    /\.dd-site-header\.dd-header-solid\s+\.dd-mobile-menu-toggle__line\s*\{[^}]*background:\s*#fff\s*!important/s,
  );
});
