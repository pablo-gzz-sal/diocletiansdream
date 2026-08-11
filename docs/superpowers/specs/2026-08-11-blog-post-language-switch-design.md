# Blog Post Language Switching Design

## Goal

Switching EN/HR on an individual blog post must open its WordPress/Polylang counterpart instead of the locale homepage.

## Current behaviour and cause

The header only knows static bilingual marketing routes. It intentionally treats individual posts as unknown paths and falls back to the target-language homepage, despite WordPress returning a post-level `translations` map.

## Chosen design

Use a small shared route-state service. Once `BlogPostPage` has loaded a post, it registers the current route and its validated WordPress translation slugs. `Header` checks that route-specific destination before its existing static page mapping.

The registration is valid only for the exact active URL and is cleared when leaving the post. This prevents a previous post from influencing another page.

## Destination rules

- English translation: `/${translations.en}`
- Croatian translation: `/hr/${translations.hr}`
- A slug must be a non-empty, single URL segment.
- If the post lacks the requested translation, has invalid slug data, or the stored route does not match the active route, use the existing fallback: the selected language homepage.

## Scope

- No additional WordPress request.
- No changes to the existing static marketing-page or blog-index mapping.
- Tests cover EN-to-HR, HR-to-EN, stale registration rejection, invalid/missing translations, and clearing the registration on post-page teardown.
