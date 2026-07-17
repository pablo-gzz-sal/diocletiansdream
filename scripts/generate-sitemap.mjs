// Build-time sitemap generator for the static (prerendered) build.
//
// Replaces the dynamic /sitemap.xml route that used to live in the Node SSR
// server. Run automatically after `ng build` (see the "build" npm script). It
// reads siteUrl / wpBaseUrl straight out of src/environments/environment.ts so
// there is a single source of truth, fetches every WordPress post slug, and
// writes a real static sitemap.xml into the browser output folder.

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const OUT_DIR = join(root, 'dist/diocletiansdream/browser');

/** Pull a string value (e.g. siteUrl) out of environment.ts without executing it. */
function readEnvValue(source, key) {
  const match = source.match(new RegExp(`${key}\\s*:\\s*['"\`]([^'"\`]+)['"\`]`));
  return match ? match[1] : undefined;
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    console.error(`[sitemap] Output folder not found: ${OUT_DIR}. Run "ng build" first.`);
    process.exit(1);
  }

  const envSource = await readFile(join(root, 'src/environments/environment.ts'), 'utf8');
  const SITE_URL = (readEnvValue(envSource, 'siteUrl') ?? 'https://diocletiansdream.com').replace(/\/+$/, '');
  const WP_BASE_URL = (readEnvValue(envSource, 'wpBaseUrl') ?? '').replace(/\/+$/, '');

  // Pages that exist in BOTH locales. Must mirror TRANSLATED_PATHS in
  // src/app/core/i18n/locale-url.ts — this script parses environment.ts by
  // regex rather than importing TypeScript, so it cannot import that list.
  const translatedPages = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/experience/', changefreq: 'monthly', priority: '0.9' },
    { path: '/visit/', changefreq: 'monthly', priority: '0.9' },
    { path: '/booking/', changefreq: 'weekly', priority: '0.9' },
    { path: '/about/', changefreq: 'monthly', priority: '0.7' },
  ];

  // English-only: no Croatian content exists, so no hreflang alternates.
  // /dd-thankyou/ is deliberately absent — it is noindex.
  const enOnlyPages = [
    { path: '/blog/', changefreq: 'weekly', priority: '0.8' },
    { path: '/privacy/', changefreq: 'yearly', priority: '0.2' },
    { path: '/terms/', changefreq: 'yearly', priority: '0.2' },
    { path: '/cookies/', changefreq: 'yearly', priority: '0.2' },
  ];

  // English path -> Croatian slug. Mirrors HR_SLUGS in
  // src/app/core/i18n/locale-url.ts — update both together.
  const HR_SLUGS = {
    '/experience/': '/iskustvo/',
    '/visit/': '/posjet/',
    '/about/': '/o-nama/',
    '/booking/': '/rezervacija/',
  };

  const hrPath = (p) => (p === '/' ? '/hr/' : `/hr${HR_SLUGS[p] ?? p}`);

  /** Reciprocal alternates. Both members of a pair emit the SAME three tags —
   *  Google ignores one-way hreflang annotations. */
  const altBlock = (p) =>
    [
      `    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${p}"/>`,
      `    <xhtml:link rel="alternate" hreflang="hr" href="${SITE_URL}${hrPath(p)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${p}"/>`,
    ].join('\n');

  const entry = (loc, { changefreq, priority }, alternatesFor) =>
    `  <url>\n    <loc>${loc}</loc>\n` +
    (alternatesFor ? `${altBlock(alternatesFor)}\n` : '') +
    `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

  let posts = [];
  if (WP_BASE_URL) {
    try {
      const api = `${WP_BASE_URL}/wp-json/wp/v2/posts?per_page=100&_fields=slug,modified`;
      const resp = await fetch(api);
      if (resp.ok) posts = await resp.json();
    } catch {
      console.warn('[sitemap] WordPress unreachable — emitting static pages only.');
    }
  }

  // A blog slug colliding with a routing prefix would silently break that
  // route: ':slug' is a single-segment wildcard, so a post slugged "hr" or
  // "dd-thankyou" would fight the real page. Fail the build loudly instead.
  const RESERVED = ['hr', 'dd-thankyou'];
  const collisions = posts.map((p) => p.slug).filter((s) => RESERVED.includes(s));
  if (collisions.length) {
    console.error(
      `[sitemap] FATAL: WordPress post slug(s) collide with reserved routes: ${collisions.join(', ')}. ` +
        `Rename the post(s) in WordPress — these URLs belong to the site's own pages.`,
    );
    process.exit(1);
  }

  const urls = [
    ...translatedPages.map((p) => entry(`${SITE_URL}${p.path}`, p, p.path)),
    ...translatedPages.map((p) =>
      entry(`${SITE_URL}${hrPath(p.path)}`, { ...p, priority: '0.8' }, p.path),
    ),
    ...enOnlyPages.map((p) => entry(`${SITE_URL}${p.path}`, p, null)),
    ...posts.map((post) => {
      const lastmod = post.modified
        ? `\n    <lastmod>${new Date(post.modified).toISOString()}</lastmod>`
        : '';
      return `  <url>\n    <loc>${SITE_URL}/${post.slug}/</loc>${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
    }),
  ];

  // The xmlns:xhtml declaration is mandatory once xhtml:link is used — without
  // it the whole sitemap fails to parse.
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${urls.join('\n')}\n</urlset>\n`;

  await writeFile(join(OUT_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`[sitemap] Wrote sitemap.xml with ${urls.length} URLs (${posts.length} posts).`);

  await assertSitemappedPagesAreIndexable(xml);
}

/**
 * Every URL in the sitemap must have prerendered as a real, indexable page.
 *
 * This exists because of a live near-miss: a helper used NodeList.forEach,
 * which Chrome has and domino (the prerenderer's DOM) does not. It threw for
 * every post, the component's error handler turned that into "Post not found" +
 * noindex, and `ng build` still printed "Prerendered 46 static routes" and
 * exited 0. Unit tests could not catch it — they run in a real browser. The
 * built output is the only place this class of bug is visible, so check it here
 * rather than trusting a green build.
 */
async function assertSitemappedPagesAreIndexable(xml) {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const broken = [];

  for (const loc of locs) {
    const path = new URL(loc).pathname;
    const file = join(OUT_DIR, path, 'index.html');

    if (!existsSync(file)) {
      broken.push(`${path} — not prerendered (no ${path}index.html)`);
      continue;
    }

    const html = await readFile(file, 'utf8');
    // Only the <head> matters: "noindex" can legitimately appear in body copy.
    const head = html.slice(0, html.indexOf('</head>'));
    if (/<meta[^>]+name="robots"[^>]*content="[^"]*noindex/i.test(head)) {
      broken.push(`${path} — prerendered as noindex`);
    }
  }

  if (broken.length) {
    console.error(
      `[sitemap] FATAL: ${broken.length} sitemapped page(s) are not indexable — ` +
        `they would be submitted to Google and then refuse to be indexed:\n  ` +
        broken.join('\n  '),
    );
    process.exit(1);
  }

  console.log(`[sitemap] Verified all ${locs.length} sitemapped pages prerendered as indexable.`);
}

main();
