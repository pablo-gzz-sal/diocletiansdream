# Blog Post Language Switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the EN/HR control navigate an individual WordPress post to its corresponding Polylang translation, falling back to the target-language homepage only when no valid translation exists.

**Architecture:** A root-provided `PostLanguageRouteService` stores one validated translation pair for the currently loaded post. `BlogPostPage` registers it after its existing WordPress request resolves and clears it when destroyed; `Header` consults it before the current static route mapping. This reuses the post payload already on screen and adds no API request.

**Tech Stack:** Angular 20 standalone components, Angular Router, Jasmine/Karma, WordPress REST translation data.

---

### Task 1: Add a focused post translation route-state service

**Files:**
- Create: `src/app/core/i18n/post-language-route.service.ts`
- Create: `src/app/core/i18n/post-language-route.service.spec.ts`

- [ ] **Step 1: Write the failing service tests**

```ts
it('returns the Croatian route for a registered English post', () => {
  service.register('/diocletians-palace-vr-experience', {
    en: 'diocletians-palace-vr-experience',
    hr: 'vr-iskustvo-dioklecijanova-palaca',
  });

  expect(service.destinationFor('/diocletians-palace-vr-experience', 'hr'))
    .toBe('/hr/vr-iskustvo-dioklecijanova-palaca');
});

it('returns the English route for a registered Croatian post', () => {
  service.register('/hr/vr-iskustvo-dioklecijanova-palaca', {
    en: 'diocletians-palace-vr-experience',
    hr: 'vr-iskustvo-dioklecijanova-palaca',
  });

  expect(service.destinationFor('/hr/vr-iskustvo-dioklecijanova-palaca', 'en'))
    .toBe('/diocletians-palace-vr-experience');
});

it('rejects stale, incomplete, and unsafe slug data', () => {
  service.register('/current-post', { en: 'current-post', hr: '' });
  expect(service.destinationFor('/current-post', 'hr')).toBeNull();
  expect(service.destinationFor('/other-post', 'en')).toBeNull();
});
```

- [ ] **Step 2: Run the focused test to confirm it fails**

Run:

```bash
npx ng test --watch=false --include='src/app/core/i18n/post-language-route.service.spec.ts' --browsers=ChromeHeadless
```

Expected: the service import does not resolve because the file does not exist.

- [ ] **Step 3: Implement the minimal route-state service**

```ts
import { Injectable } from '@angular/core';
import { SupportedLang } from './i18n.config';

type PostTranslations = Partial<Record<SupportedLang, string>>;

@Injectable({ providedIn: 'root' })
export class PostLanguageRouteService {
  private current: { path: string; translations: PostTranslations } | null = null;

  register(path: string, translations: PostTranslations): void {
    this.current = { path: normalise(path), translations };
  }

  clear(): void { this.current = null; }

  destinationFor(path: string, target: SupportedLang): string | null {
    if (!this.current || this.current.path !== normalise(path)) return null;
    const slug = this.current.translations[target];
    if (!slug || !/^[^/?#]+$/.test(slug)) return null;
    return target === 'hr' ? `/hr/${slug}` : `/${slug}`;
  }
}
```

Use a local `normalise()` helper with the same trailing-slash/query/hash behavior as `locale-url.ts`; do not export or duplicate the marketing-route lists.

- [ ] **Step 4: Run the focused test to confirm it passes**

Run:

```bash
npx ng test --watch=false --include='src/app/core/i18n/post-language-route.service.spec.ts' --browsers=ChromeHeadless
```

Expected: all service assertions pass.

- [ ] **Step 5: Commit the service**

```bash
git add src/app/core/i18n/post-language-route.service.ts src/app/core/i18n/post-language-route.service.spec.ts
git commit -m "feat: store current post language routes"
```

### Task 2: Connect the post page and header language control

**Files:**
- Modify: `src/app/features/blog/blog-post-page/blog-post-page.ts:1-75`
- Modify: `src/app/core/components/header/header.ts:1-115`
- Modify: `src/app/features/blog/blog-post-page/blog-post-page.spec.ts:1-155`
- Modify: `src/app/core/components/header/header.spec.ts:1-30`

- [ ] **Step 1: Write the failing integration tests**

```ts
it('registers the loaded post translations for the current locale URL', () => {
  // Arrange the existing WpService spy to return a post with:
  // translations: { en: 'diocletians-palace-vr-experience', hr: 'vr-iskustvo-dioklecijanova-palaca' }
  // then call component.fetch('diocletians-palace-vr-experience').
  expect(routeState.destinationFor('/diocletians-palace-vr-experience', 'hr'))
    .toBe('/hr/vr-iskustvo-dioklecijanova-palaca');
});

it('clears the post translation registration when destroyed', () => {
  component.ngOnDestroy();
  expect(routeState.destinationFor('/diocletians-palace-vr-experience', 'hr')).toBeNull();
});

it('uses the current post translation before the homepage fallback', () => {
  routeState.register('/diocletians-palace-vr-experience', {
    en: 'diocletians-palace-vr-experience', hr: 'vr-iskustvo-dioklecijanova-palaca',
  });
  router.url = '/diocletians-palace-vr-experience';
  component.switchTo('hr');
  expect(router.navigateByUrl).toHaveBeenCalledWith('/hr/vr-iskustvo-dioklecijanova-palaca');
});

it('uses the existing target-language homepage fallback without a post translation', () => {
  router.url = '/untranslated-post';
  component.switchTo('hr');
  expect(router.navigateByUrl).toHaveBeenCalledWith('/hr');
});
```

- [ ] **Step 2: Run the focused component tests to confirm they fail**

Run:

```bash
npx ng test --watch=false --include='src/app/features/blog/blog-post-page/blog-post-page.spec.ts' --browsers=ChromeHeadless
npx ng test --watch=false --include='src/app/core/components/header/header.spec.ts' --browsers=ChromeHeadless
```

Expected: the new registration and navigation assertions fail because neither component uses `PostLanguageRouteService` yet.

- [ ] **Step 3: Register only validated post data, and clear it on teardown**

```ts
// BlogPostPage constructor
private postLanguageRoutes = inject(PostLanguageRouteService);

// in fetch() success block, after this.post is assigned
if (this.post) {
  this.postLanguageRoutes.register(this.router.url, this.post.translations ?? {});
  this.applySeo(this.post);
}

// ngOnDestroy()
this.postLanguageRoutes.clear();
```

Inject `Router` into `BlogPostPage`. Clear any prior route registration before starting a new fetch and in the error/not-found branches, so incomplete requests cannot leave stale destinations.

- [ ] **Step 4: Make header switching prefer the registered post target**

```ts
switchTo(target: SupportedLang) {
  if (target === this.currentLang()) return;
  const postDestination = this.postLanguageRoutes.destinationFor(this.router.url, target);
  if (postDestination) {
    this.router.navigateByUrl(postDestination);
    return;
  }
  const { path } = stripLocale(this.router.url);
  const destination = hasCounterpart(path)
    ? withLocale(path, target)
    : target === DEFAULT_LANG ? path : withLocale('/', target);
  this.router.navigateByUrl(destination);
}
```

Retain the existing fallback expression exactly, preserving homepage fallback for untranslated posts.

- [ ] **Step 5: Run focused tests and static checks**

Run:

```bash
npx ng test --watch=false --include='src/app/core/i18n/post-language-route.service.spec.ts' --browsers=ChromeHeadless
npx ng test --watch=false --include='src/app/features/blog/blog-post-page/blog-post-page.spec.ts' --browsers=ChromeHeadless
npx ng test --watch=false --include='src/app/core/components/header/header.spec.ts' --browsers=ChromeHeadless
npx tsc -p tsconfig.app.json --noEmit
npx tsc -p tsconfig.spec.json --noEmit
```

Expected: focused tests pass and both TypeScript compilations complete without errors.

- [ ] **Step 6: Verify both live directions**

Run the local server and check:

```text
/diocletians-palace-vr-experience/ → HR → /hr/vr-iskustvo-dioklecijanova-palaca/
/hr/vr-iskustvo-dioklecijanova-palaca/ → EN → /diocletians-palace-vr-experience/
```

Also check a deliberately untranslated post: switching uses `/hr/` or `/` according to the target language.

- [ ] **Step 7: Commit the integration**

```bash
git add src/app/core/components/header/header.ts src/app/core/components/header/header.spec.ts src/app/features/blog/blog-post-page/blog-post-page.ts src/app/features/blog/blog-post-page/blog-post-page.spec.ts
git commit -m "fix: switch blog posts to their translations"
```

## Plan self-review

- Spec coverage: Tasks 1–2 cover valid EN/HR routes, fallback behavior, route staleness, lifecycle clearing, and tests.
- Placeholder scan: no TODO/TBD or undefined task references.
- Type consistency: `PostLanguageRouteService`, `register`, `clear`, and `destinationFor` use the same names throughout.
