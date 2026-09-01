import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const stylesheet = readFileSync(
  resolve(projectRoot, 'src/app/features/landing-page/landing-page.css'),
  'utf8',
);

test('featured articles are a centred fixed-width card group', () => {
  const innerRule = stylesheet.match(/\.featured-articles__inner\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const gridRule = stylesheet.match(/\.featured-articles__grid\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const cardRule = stylesheet.match(/\.featured-article\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(innerRule, /margin(?:-inline)?:\s*0 auto;/);
  assert.match(gridRule, /display:\s*flex;/);
  assert.match(gridRule, /justify-content:\s*center;/);
  assert.match(gridRule, /gap:\s*2\.5rem 3rem;/);
  assert.match(cardRule, /flex:\s*0 1 13\.25rem;/);
});
