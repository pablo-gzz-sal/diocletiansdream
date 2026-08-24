import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const loadLocale = (locale) =>
  JSON.parse(readFileSync(`src/assets/i18n/${locale}.json`, 'utf8'));

const en = loadLocale('en');
const hr = loadLocale('hr');

test('English copy identifies Josip Belamarić as Professor everywhere', () => {
  assert.equal(en.home.authority.honorific, 'Professor');
  assert.match(en.experiencePage.faq.items[9].a, /Professor Josip Belamarić/);
  assert.match(en.aboutPage.faq.items[3].a, /Professor Josip Belamarić/);
  assert.match(en.aboutPage.seo.metaDescription, /Professor Josip Belamarić/);
  assert.doesNotMatch(JSON.stringify(en), /academician/i);
});

test('Croatian copy uses Profesor with grammatically correct inflection', () => {
  assert.equal(hr.home.authority.honorific, 'Profesor');
  assert.match(hr.experiencePage.faq.items[9].a, /profesor Josip Belamarić/);
  assert.match(hr.aboutPage.faq.items[3].a, /profesor Josip Belamarić/);
  assert.match(hr.aboutPage.seo.metaDescription, /profesora Josipa Belamarića/);
  assert.doesNotMatch(JSON.stringify(hr), /akademik/i);
});
