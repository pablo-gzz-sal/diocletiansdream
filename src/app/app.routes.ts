import { Routes } from '@angular/router';
import { BlogPostPage } from './features/blog/blog-post-page/blog-post-page';
import { NotFound } from './features/not-found/not-found';
import { ThankYou } from './features/thank-you/thank-you';
import { EN_ONLY_ROUTES, localizedRoute, localizedRoutes } from './core/i18n/locale-routes';

export const routes: Routes = [
  // Croatian. MUST stay ahead of ':slug' below — ':slug' is a single-segment
  // wildcard and would otherwise match 'hr' and render it as a blog post.
  // Componentless parent: children render into the root outlet, so no shell.
  {
    path: 'hr',
    children: [
      ...localizedRoutes('hr'),
      localizedRoute({ path: '404', component: NotFound }, 'hr'),
      localizedRoute({ path: '**', component: NotFound }, 'hr'),
    ],
  },

  // English at the root (unchanged URLs).
  ...localizedRoutes('en', EN_ONLY_ROUTES),

  // TuriTop booking confirmation. Also must precede ':slug'. Not localized:
  // it is noindex and excluded from the sitemap.
  { path: 'dd-thankyou', component: ThankYou },

  // Dedicated 404 page with a concrete URL so the static build emits a real
  // `404/index.html` for Apache's `ErrorDocument 404`. Must stay BEFORE
  // `:slug`, otherwise it would be treated as a blog slug.
  localizedRoute({ path: '404', component: NotFound }, 'en'),

  // Root-level blog posts, e.g. /what-to-do-in-split. Must stay AFTER all
  // fixed routes so it only catches single-segment slugs nothing else owns.
  localizedRoute({ path: ':slug', component: BlogPostPage }, 'en'),

  // Anything else is a real 404 (renders NotFound, not the homepage).
  localizedRoute({ path: '**', component: NotFound }, 'en'),
];
