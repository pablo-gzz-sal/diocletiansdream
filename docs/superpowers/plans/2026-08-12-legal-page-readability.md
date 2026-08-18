# Legal Page Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Privacy, Terms, and Cookies into clear editorial documents while preserving every word of the current legal text and the established site shell.

**Architecture:** Keep one shared `PolicyPageComponent` responsible for the legal-page shell and typography, with globally scoped, legal-specific CSS because Angular-projected content does not receive the child component's emulated style attribute. Restructure each policy's existing blank-line-delimited text into semantic headings and paragraphs, protected by normalized-text SHA-256 regression hashes.

**Tech Stack:** Angular 20 standalone components, HTML/CSS, Node's built-in test runner, Jasmine/Karma, here.now static hosting.

---

## Working Constraint

Work directly in `diocletiansdream-redesign/`. Do not stage or commit any file unless the user explicitly changes this instruction.

## File Structure

- Create `scripts/legal-page-readability.test.mjs`: guards legal wording, semantic structure, shared style hooks, and mobile overflow behavior.
- Modify `package.json`: adds `test:legal-pages`.
- Modify `src/app/features/legal/policy-page-component/policy-page-component.ts`: opts the fully prefixed shared legal CSS out of emulated encapsulation so it can style projected policy markup.
- Modify `src/app/features/legal/policy-page-component/policy-page-component.html`: introduces the editorial header and semantic document container.
- Modify `src/app/features/legal/policy-page-component/policy-page-component.css`: defines desktop reading surface, type hierarchy, links/lists, and the edge-to-edge mobile document treatment within the 16 px page gutter.
- Modify `src/app/features/legal/privacy/privacy.html`: converts existing blocks into headings and paragraphs without changing words.
- Modify `src/app/features/legal/terms/terms.html`: converts existing blocks into headings and paragraphs without changing words.
- Modify `src/app/features/legal/cookies/cookies.html`: converts existing blocks into headings and paragraphs without changing words.
- Modify `../dd-live.md`: records the current here.now preview, mobile safeguards, verification commands, and publishing procedure.

### Task 1: Add Failing Legal-Page Regression Contracts

**Files:**
- Create: `scripts/legal-page-readability.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the wording and structure regression test**

Create `scripts/legal-page-readability.test.mjs`:

```js
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
  assert.match(template, /<article[^>]*class="policy-document"[^>]*aria-labelledby="policy-title"/s);
  assert.match(css, /\.policy-page \.legal-copy\s*\{[^}]*max-width:\s*68ch/s);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*?\.policy-page \.policy-document\s*\{[^}]*padding:\s*0[^}]*box-shadow:\s*none/s,
  );
});
```

- [ ] **Step 2: Add the package script**

Add under `scripts` in `package.json`:

```json
"test:legal-pages": "node --test scripts/legal-page-readability.test.mjs"
```

- [ ] **Step 3: Run the new suite and verify the intended failures**

Run:

```bash
npm run test:legal-pages
```

Expected: wording hash test PASS; semantic structure and shared shell/style tests FAIL because the documents are still flat and the shared editorial hooks do not exist.

### Task 2: Build the Shared Editorial Legal-Page Shell

**Files:**
- Modify: `src/app/features/legal/policy-page-component/policy-page-component.ts`
- Modify: `src/app/features/legal/policy-page-component/policy-page-component.html`
- Modify: `src/app/features/legal/policy-page-component/policy-page-component.css`

- [ ] **Step 1: Allow the prefixed component stylesheet to reach projected content**

Import `ViewEncapsulation` and add the component option:

```ts
import { Component, Input, OnInit, ViewEncapsulation, inject } from '@angular/core';

@Component({
  selector: 'app-policy-page-component',
  standalone: true,
  imports: [Header, Footer],
  templateUrl: './policy-page-component.html',
  styleUrl: './policy-page-component.css',
  encapsulation: ViewEncapsulation.None,
})
```

All selectors in the stylesheet begin with `.policy-page`, so disabling emulated encapsulation cannot affect unrelated pages.

- [ ] **Step 2: Replace the shared template with the editorial shell**

Use this complete `policy-page-component.html`:

```html
<app-header></app-header>

<main class="policy-page">
  <div class="policy-page__shell dd-page-gutter">
    <header class="policy-page__header">
      <p class="policy-page__eyebrow">Legal document</p>
      <h1 id="policy-title" class="policy-page__title">{{ title }}</h1>

      @if (updatedAt) {
        <p class="policy-page__updated">
          <span aria-hidden="true"></span>
          Last updated: {{ updatedAt }}
        </p>
      }
    </header>

    <article class="policy-document" aria-labelledby="policy-title">
      <ng-content></ng-content>
    </article>
  </div>
</main>

<app-footer></app-footer>
```

- [ ] **Step 3: Add the fully scoped legal typography and responsive surface**

Replace `policy-page-component.css` with:

```css
.policy-page {
  min-height: 70dvh;
  padding-block: clamp(7.5rem, 12vw, 10rem) clamp(5rem, 9vw, 8rem);
  background:
    radial-gradient(circle at 12% 4%, rgba(194, 154, 89, 0.09), transparent 28rem),
    var(--color-cream);
  color: var(--color-ink);
}

.policy-page__shell {
  width: 100%;
  max-width: 78rem;
  margin-inline: auto;
}

.policy-page__header,
.policy-page .legal-copy {
  width: 100%;
  max-width: 68ch;
  margin-inline: auto;
}

.policy-page__header {
  margin-bottom: clamp(2.25rem, 5vw, 4rem);
}

.policy-page__eyebrow {
  margin: 0;
  color: var(--dd-gold-deep);
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.policy-page__title {
  max-width: 14ch;
  margin: 0.65rem 0 0;
  color: var(--color-ink);
  font-family: var(--font-serif);
  font-size: clamp(3rem, 7vw, 5.75rem);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.policy-page__updated {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.2rem 0 0;
  color: var(--color-ink-60);
  font-family: var(--font-sans);
  font-size: 0.84rem;
}

.policy-page__updated span {
  width: 2.5rem;
  height: 1px;
  background: var(--dd-gold);
}

.policy-page .policy-document {
  padding: clamp(2rem, 5vw, 4.25rem);
  border: 1px solid rgba(26, 24, 20, 0.08);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.64);
  box-shadow: 0 1.5rem 5rem rgba(66, 48, 25, 0.08);
}

.policy-page .legal-copy {
  color: var(--color-ink-60);
  font-family: var(--font-sans);
  font-size: clamp(1rem, 1.2vw, 1.075rem);
  line-height: 1.78;
}

.policy-page .legal-copy h2 {
  position: relative;
  margin: 3.5rem 0 1rem;
  padding-top: 1.25rem;
  color: var(--color-ink);
  font-family: var(--font-serif);
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.015em;
  text-wrap: balance;
}

.policy-page .legal-copy h2::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3rem;
  height: 1px;
  background: var(--dd-gold);
}

.policy-page .legal-copy h2:first-child {
  margin-top: 0;
}

.policy-page .legal-copy p {
  margin: 0 0 1.15rem;
  text-wrap: pretty;
}

.policy-page .legal-copy ul,
.policy-page .legal-copy ol {
  display: grid;
  gap: 0.65rem;
  margin: 0 0 1.5rem;
  padding-left: 1.25rem;
}

.policy-page .legal-copy li::marker {
  color: var(--dd-gold-deep);
}

.policy-page .legal-copy a {
  color: var(--dd-purple);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}

.policy-page .legal-copy a:focus-visible {
  outline: 2px solid var(--dd-purple);
  outline-offset: 3px;
}

.policy-page .legal-copy,
.policy-page .legal-copy p,
.policy-page .legal-copy li,
.policy-page .legal-copy a {
  overflow-wrap: anywhere;
}

@media (max-width: 767px) {
  .policy-page {
    padding-block: 7rem 4.5rem;
    background: var(--color-cream);
  }

  .policy-page__header {
    margin-bottom: 2.5rem;
  }

  .policy-page__title {
    font-size: clamp(2.75rem, 14vw, 4.25rem);
  }

  .policy-page .policy-document {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .policy-page .legal-copy h2 {
    margin-top: 2.75rem;
    font-size: clamp(1.65rem, 8vw, 2rem);
  }
}
```

- [ ] **Step 4: Run the focused suite**

```bash
npm run test:legal-pages
```

Expected: shared shell/style test PASS; semantic structure test remains FAIL until the three documents are converted; wording hashes remain PASS.

### Task 3: Convert the Three Flat Policies into Semantic Documents

**Files:**
- Modify: `src/app/features/legal/privacy/privacy.html`
- Modify: `src/app/features/legal/terms/terms.html`
- Modify: `src/app/features/legal/cookies/cookies.html`

- [ ] **Step 1: Mechanically convert blank-line blocks without editing their text**

For each page, keep the existing `<app-policy-page-component ...>` opening and closing tags. Replace the inner `<div><p>...</p></div>` with `<div class="legal-copy">...</div>` where every blank-line-delimited source block becomes one element.

Use `<h2>` only for these exact existing block strings:

```text
Privacy: Privacy Policy; Definitions and key terms; What information do we collect?; How do we use this information?; When do we use customer information from third parties?; Do we share the information we collect with third parties?; How do we use your email adress?; Could my information be transferred to other countries?; Is the information collected through our service secure?; Can I update or correct my information?; Updates to Our service; Personnel; Sale of business; Affiliates; How long do we keep your information?; How do we protect your information?; Governing law; Your consent; Links to other websites; Cookies; Remarketing Services; Payment details; Changes to our Privacy Policy; Third-Party Services; Facebook Pixel; Data Protection; What is GDPR?; What is personal data?; Why is GDPR important?; Individual Data Subject’s RIghts – Data Access, Portability and Deletion; Contact Us

Terms: General Terms; License; Definitions and key terms; Restrictions; Payment; Return and Refund Policy; Your Suggestions; Your Consent; Links to Other Websites; Cookies; Changes To Our Terms & Conditions; Modifications to Our service; Updates to Our service; Third-Party Services; Term and Termination; Indemnification; No Warranties; Limitation of Liability; Severability; Waiver; Amendments to this Agreement; Entire Agreement; Updates to Our Terms; Intellectual Property; Agreement to Arbitrate; Notice of Dispute; Binding Arbitration; Submissions and Privacy; Promotions; Typographical Errors; Miscellaneous; Disclaimer; Contact Us

Cookies: Definitions and key terms; Introduction; What is a cookie?; Why do we use cookies?; What kind of cookies do we use?; Essential cookies; Performance and Functionality Cookies; Marketing Cookies; Analytics and Customization Cookies; Social Media Cookies; Third Party Cookies; How can you manage cookies?; Your Consent; Contact Us
```

Every other block becomes `<p>` with its exact existing text. Do not fix spelling, punctuation, brand form, addresses, or legal wording in this task.

- [ ] **Step 2: Run the wording guard immediately**

```bash
npm run test:legal-pages
```

Expected: all tests PASS. If a wording hash fails, restore the changed text and repeat the structural conversion without editing copy.

- [ ] **Step 3: Format only the three changed policy templates**

```bash
npx prettier --write src/app/features/legal/privacy/privacy.html src/app/features/legal/terms/terms.html src/app/features/legal/cookies/cookies.html
npm run test:legal-pages
```

Expected: Prettier succeeds and all legal-page tests remain PASS, including identical normalized wording hashes.

### Task 4: Update the Development Knowledge Handoff

**Files:**
- Modify: `../dd-live.md`

- [ ] **Step 1: Add the current redesign preview workflow**

Append this section to `../dd-live.md`:

```markdown
## Here Now redesign preview workflow — 2026-08-12

- Active workspace: `diocletiansdream-redesign/`. Make redesign changes directly there; do not copy them into `diocletiansdream/` or deploy to SiteGround without explicit approval.
- Permanent authenticated client preview: `https://pearly-dory-g7y4.here.now/`.
- Current user preference: leave redesign working changes unstaged unless the user explicitly asks for staging or commits.
- Before every preview update, run `npm run test:mobile-gutters`, `npm run test:mobile-headings`, `npm run test:mobile-performance`, the complete Chrome Headless Angular suite, and `CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true /usr/local/bin/npm run build`.
- Serve `dist/diocletiansdream/browser/` locally and inspect the production output at 320 px and 390 px. Check English and Croatian headings, horizontal overflow, closed/open mobile-menu state, and the behavior specific to the changed page. Also inspect a desktop width to protect desktop-only effects.
- Publish the built directory with `/Users/gordansabic/.claude/skills/here-now/scripts/publish.sh dist/diocletiansdream/browser --slug pearly-dory-g7y4 --client codex`.
- The publish is not complete when file upload finishes. Keep the process alive until it prints `finalizing...`, `publish_result.action=update`, `publish_result.auth_mode=authenticated`, and `publish_result.persistence=permanent`.
- Smoke-test the public here.now routes after finalization and confirm the CSS/JS asset hashes changed. A successful local build or upload phase alone does not prove the public preview updated.
- Mobile performance safeguards: decorative animation, filters, backdrop filters, and scroll-linked effects remain disabled below 768 px; `body` uses scrolling rather than fixed background attachments; header scroll state is passive and animation-frame throttled; and `.dd-mobile-menu-layer` is absent from the DOM while closed.
```

- [ ] **Step 2: Verify the handoff contains every procedure marker**

```bash
rg -n "pearly-dory-g7y4|test:mobile-performance|finalizing|animation-frame throttled|unstaged" ../dd-live.md
```

Expected: the new section returns matches for all five workflow markers.

### Task 5: Full Verification and Publish

**Files:**
- Verify: all modified files and `dist/diocletiansdream/browser/`

- [ ] **Step 1: Run static regressions**

```bash
npm run test:legal-pages
npm run test:mobile-gutters
npm run test:mobile-headings
npm run test:mobile-performance
git diff --check
```

Expected: all Node tests pass and `git diff --check` produces no output.

- [ ] **Step 2: Run the full Angular suite**

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' /usr/local/bin/node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --progress=false
```

Expected: every Angular test passes with zero failures.

- [ ] **Step 3: Build the production site**

```bash
CI=true MSGPACKR_NATIVE_ACCELERATION_DISABLED=true /usr/local/bin/npm run build
```

Expected: production build, sitemap generation, prerendering, and `verify-build.mjs` all succeed.

- [ ] **Step 4: Inspect all three production legal pages**

Serve `dist/diocletiansdream/browser/`, then inspect `/privacy/`, `/terms/`, and `/cookies/` at 320 px, 390 px, and 1280 px. Confirm:

```text
- visible title and last-updated date
- readable serif section headings and sans-serif body copy
- paragraphs are visually separated
- approximately 65–70 character desktop line length
- no horizontal overflow or broken long URLs
- exactly 16 px mobile page gutter
- unchanged site header and footer
- no decorative legal-page animation on mobile
```

- [ ] **Step 5: Publish to the existing permanent here.now preview**

```bash
/Users/gordansabic/.claude/skills/here-now/scripts/publish.sh dist/diocletiansdream/browser --slug pearly-dory-g7y4 --client codex
```

Expected: the script finalizes an authenticated permanent update at `https://pearly-dory-g7y4.here.now/`.

- [ ] **Step 6: Smoke-test the live legal routes**

Open the three public legal URLs at mobile width and verify the new asset hash, semantic headings, paragraph spacing, no overflow, and unchanged policy wording. Reset the temporary browser viewport and stop the local server afterward.
