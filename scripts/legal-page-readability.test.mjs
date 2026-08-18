import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');
const policies = {
  privacy: {
    path: 'src/app/features/legal/privacy/privacy.html',
    hash: '290639eac6788c9beda67079bf5583307850b70fe3503d22985496e2ef0273c8',
    minimumHeadings: 20,
  },
  terms: {
    path: 'src/app/features/legal/terms/terms.html',
    hash: '527f5265862b930e6027b8e2309197e7f3d1f30c3a6b37affc9566961e6a502d',
    minimumHeadings: 25,
  },
  cookies: {
    path: 'src/app/features/legal/cookies/cookies.html',
    hash: 'cf759f527dc87edcf32db35af0560ded8f2a9969f3bb58dd6975d119a5304050',
    minimumHeadings: 12,
  },
};

function projectedText(source) {
  const body = source.slice(
    source.indexOf('>') + 1,
    source.lastIndexOf('</app-policy-page-component>'),
  );

  return body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

test('legal wording remains byte-stable after whitespace and markup normalization', () => {
  for (const policy of Object.values(policies)) {
    const hash = createHash('sha256').update(projectedText(read(policy.path))).digest('hex');
    assert.equal(hash, policy.hash, policy.path);
  }
});

test('each legal document exposes real section headings and paragraphs', () => {
  for (const policy of Object.values(policies)) {
    const html = read(policy.path);
    assert.match(html, /class="legal-copy"/);
    assert.ok((html.match(/<h2/g) ?? []).length >= policy.minimumHeadings, policy.path);
    assert.ok((html.match(/<p/g) ?? []).length >= policy.minimumHeadings, policy.path);
  }
});

test('the shared policy shell has a labelled document and readable CSS hooks', () => {
  const template = read(
    'src/app/features/legal/policy-page-component/policy-page-component.html',
  );
  const css = read('src/app/features/legal/policy-page-component/policy-page-component.css');

  assert.match(template, /<main[^>]*class="policy-page"/);
  assert.match(template, /<h1[^>]*id="policy-title"/);
  assert.match(
    template,
    /<article[^>]*class="policy-document"[^>]*aria-labelledby="policy-title"/s,
  );
  assert.match(css, /\.policy-page \.legal-copy\s*\{[^}]*max-width:\s*68ch/s);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.policy-page \.policy-document\s*\{[^}]*padding:\s*0[^}]*box-shadow:\s*none/s,
  );
});
