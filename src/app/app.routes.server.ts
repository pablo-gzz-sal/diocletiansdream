import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';

/**
 * Fetch every published blog-post slug from WordPress so each post can be
 * prerendered to its own static HTML file at build time. Paginates through the
 * REST API (100 per page). If WordPress is unreachable the build still succeeds
 * with the static pages — only the posts are skipped (logged below).
 */
async function fetchAllPostSlugs(): Promise<string[]> {
  const base = environment.wpBaseUrl.replace(/\/+$/, '');
  const slugs: string[] = [];

  try {
    for (let page = 1; page <= 50; page++) {
      const url = `${base}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=slug`;
      const res = await fetch(url);
      if (!res.ok) break; // 400 => ran past the last page
      const posts: Array<{ slug: string }> = await res.json();
      if (!posts.length) break;
      for (const p of posts) if (p?.slug) slugs.push(p.slug);
      if (posts.length < 100) break;
    }
  } catch (err) {
    console.warn('[prerender] Could not fetch post slugs from WordPress:', err);
  }

  return slugs;
}

export const serverRoutes: ServerRoute[] = [
  // Static pages — prerendered to `<route>/index.html`.
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'experience', renderMode: RenderMode.Prerender },
  { path: 'visit', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
  { path: 'booking', renderMode: RenderMode.Prerender },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  { path: 'terms', renderMode: RenderMode.Prerender },
  { path: 'cookies', renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },

  // Blog posts at the root, one prerendered file per known slug (full SEO).
  // Unknown slugs (e.g. a post published after the last build) fall back to
  // CLIENT rendering: the app boots via the SPA-fallback rule in .htaccess,
  // reads the slug, and fetches the post live from WordPress. This means a new
  // post is reachable by direct URL immediately, and gets upgraded to a
  // prerendered file at the next scheduled rebuild.
  {
    path: ':slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      const slugs = await fetchAllPostSlugs();
      return slugs.map((slug) => ({ slug }));
    },
  },

  // In-app catch-all (client navigation to an unknown route shows NotFound).
  { path: '**', renderMode: RenderMode.Prerender },
];
