import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';

/**
 * Fetch every published blog-post slug from WordPress so each post can be
 * prerendered to its own static HTML file at build time. Paginates through the
 * REST API (100 per page).
 *
 * Throws rather than returning a short list. An empty result here does not
 * fail the build by itself — it silently produces a dist with zero blog posts,
 * which deploys as a site whose entire blog 404s. That is the exact silent
 * failure this file's route ordering is otherwise written to avoid, so a CMS
 * that cannot be read is treated as a build error.
 */
export async function fetchAllPostSlugs(lang: 'en' | 'hr' = 'en'): Promise<string[]> {
  const base = environment.wpBaseUrl.replace(/\/+$/, '');
  const slugs: string[] = [];

  for (let page = 1; page <= 50; page++) {
    // ?lang= (dd-polylang-rest mu-plugin) scopes the slugs to one language so
    // /slug/ prerenders English posts and /hr/slug/ the Croatian ones.
    const url = `${base}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=slug&lang=${lang}`;
    const res = await fetch(url);

    // 400 => ran past the last page. Anything else non-OK is a real failure.
    if (res.status === 400) break;
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);

    // A WAF challenge answers 200/202 with an HTML interstitial, which `res.ok`
    // happily accepts and `json()` then chokes on. Say so in the error, because
    // "Unexpected token '<'" 40 lines into a build log explains nothing.
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('json')) {
      throw new Error(
        `${url} -> expected JSON, got "${type}". The CMS is answering with a ` +
          `challenge or error page rather than the REST API.`
      );
    }

    const posts: Array<{ slug: string }> = await res.json();
    if (!posts.length) break;
    for (const p of posts) if (p?.slug) slugs.push(p.slug);
    if (posts.length < 100) break;
  }

  return slugs;
}

/**
 * Slugs for a locale, with the same policy the sitemap generator applies:
 * English posts are required (their absence is a broken build), Croatian ones
 * are optional — the CMS may legitimately have none published yet.
 */
async function prerenderSlugs(lang: 'en' | 'hr'): Promise<Array<{ slug: string }>> {
  const slugs = await fetchAllPostSlugs(lang);

  if (!slugs.length) {
    const message = `[prerender] WordPress returned no ${lang} post slugs.`;
    if (lang === 'hr') {
      console.warn(`${message} Prerendering no Croatian posts.`);
    } else {
      throw new Error(
        `${message} Refusing to build a site with an empty blog — check that ` +
          `${environment.wpBaseUrl} is reachable from this machine.`
      );
    }
  }

  return slugs.map((slug) => ({ slug }));
}

export const serverRoutes: ServerRoute[] = [
  // Croatian pages. MUST stay ahead of ':slug' below — the bare `hr` path is a
  // single segment that ':slug' would otherwise claim, silently prerendering
  // /hr/ as a (nonexistent) blog post. Prerendered to `hr/<route>/index.html`.
  // Croatian slugs are native (/hr/posjet/, not /hr/visit/) — see HR_SLUGS in
  // core/i18n/locale-url.ts, which is the source of truth for this list.
  { path: 'hr', renderMode: RenderMode.Prerender },
  { path: 'hr/iskustvo', renderMode: RenderMode.Prerender },
  { path: 'hr/posjet', renderMode: RenderMode.Prerender },
  { path: 'hr/o-nama', renderMode: RenderMode.Prerender },
  { path: 'hr/partneri', renderMode: RenderMode.Prerender },
  { path: 'hr/rezervacija', renderMode: RenderMode.Prerender },
  { path: 'hr/blog', renderMode: RenderMode.Prerender },
  { path: 'hr/404', renderMode: RenderMode.Prerender },

  // Croatian blog posts, one prerendered file per hr slug (same client-fallback
  // story as the root ':slug' below). MUST precede 'hr/**'.
  {
    path: 'hr/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    getPrerenderParams: () => prerenderSlugs('hr'),
  },

  { path: 'hr/**', renderMode: RenderMode.Prerender },

  // TuriTop booking confirmation (noindex). Also ahead of ':slug'.
  { path: 'dd-thankyou', renderMode: RenderMode.Prerender },

  // Static pages — prerendered to `<route>/index.html`.
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'experience', renderMode: RenderMode.Prerender },
  { path: 'visit', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'partners', renderMode: RenderMode.Prerender },
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
    getPrerenderParams: () => prerenderSlugs('en'),
  },

  // In-app catch-all (client navigation to an unknown route shows NotFound).
  { path: '**', renderMode: RenderMode.Prerender },
];
