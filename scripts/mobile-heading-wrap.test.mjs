import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('headings never use emergency character-level wrapping', () => {
  const css = read('src/styles.css');

  assert.match(
    css,
    /main\s+:where\(h1,\s*h2,\s*h3,\s*h4\)\s*\{[^}]*overflow-wrap:\s*normal[^}]*word-break:\s*normal[^}]*hyphens:\s*none/s,
  );
});

test('the Croatian authority headline fits the mobile content width', () => {
  const css = read(
    'src/app/core/components/historical-authority/historical-authority.css',
  );

  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.historical-authority__title\s*\{[^}]*max-width:\s*none[^}]*font-size:\s*clamp\(2\.25rem,\s*10\.5vw,\s*2\.75rem\)/s,
  );
});

test('mobile homepage section titles receive the full row width', () => {
  const styles = read('src/styles.css');
  const visitCss = read('src/app/core/components/visit/visit.css');
  const reviewsCss = read('src/app/core/components/reviews/reviews.css');
  const trailerCss = read('src/app/core/components/trailer/trailer.css');

  assert.match(
    styles,
    /@media\s*\(max-width:\s*640px\)[\s\S]*?\.section-h2\s*\{[^}]*font-size:\s*clamp\(2\.15rem,\s*10vw,\s*2\.4rem\)/s,
  );
  assert.match(
    visitCss,
    /@media\s*\(max-width:\s*640px\)[\s\S]*?\.visit-header\s*\{[^}]*flex-direction:\s*column[^}]*align-items:\s*flex-start/s,
  );
  assert.match(
    reviewsCss,
    /@media\s*\(max-width:\s*640px\)[\s\S]*?\.reviews-header\s*\{[^}]*flex-direction:\s*column[^}]*align-items:\s*flex-start/s,
  );
  assert.match(
    trailerCss,
    /@media\s*\(max-width:\s*640px\)[\s\S]*?\.trailer-h1\s*\{[^}]*max-width:\s*none[^}]*font-size:\s*clamp\(2\.05rem,\s*9\.8vw,\s*2\.8rem\)/s,
  );
});
