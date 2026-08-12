import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

const heroTemplates = [
  'src/app/features/experience/experience.html',
  'src/app/features/contact/contact.html',
  'src/app/features/about/about.html',
];

test('secondary-page hero titles have a mobile visibility hook', () => {
  for (const path of heroTemplates) {
    assert.match(read(path), /class="[^"]*page-hero-title-line[^"]*"/);
  }
});

test('mobile and reduced-motion modes reveal the hero titles', () => {
  const css = read('src/styles.css');

  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\),\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.page-hero-title-line\s*\{[^}]*opacity:\s*1\s*!important[^}]*transform:\s*none\s*!important/s,
  );
});

test('mobile backgrounds scroll instead of repainting as fixed layers', () => {
  const css = read('src/styles.css');

  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?body\s*\{[^}]*background-attachment:\s*scroll\s*!important/s,
  );
});

test('header scrolling is passive, frame-throttled, and cleaned up', () => {
  const header = read('src/app/core/components/header/header.ts');

  assert.doesNotMatch(header, /@HostListener\(['"]window:scroll['"]\)/);
  assert.match(
    header,
    /addEventListener\(['"]scroll['"],\s*handleScroll,\s*\{\s*passive:\s*true\s*\}\)/s,
  );
  assert.match(header, /requestAnimationFrame\(/);
  assert.match(header, /removeEventListener\(['"]scroll['"],\s*handleScroll\)/s);
  assert.match(header, /cancelAnimationFrame\(/);
});
