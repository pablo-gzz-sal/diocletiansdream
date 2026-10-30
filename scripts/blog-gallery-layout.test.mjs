import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('both WordPress gallery markups keep paired images in one row', () => {
  assert.match(css, /\.blog-prose \.wp-block-gallery \{[^}]*display: grid !important;[^}]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.blog-prose \.tiled-gallery__row \{[^}]*display: flex;/);
  assert.match(css, /\.blog-prose \.tiled-gallery__col \{[^}]*flex: 1 1 0 !important;/);
});
