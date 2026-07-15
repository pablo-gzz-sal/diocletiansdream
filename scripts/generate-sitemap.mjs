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

  const staticPages = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/experience/', changefreq: 'monthly', priority: '0.9' },
    { path: '/visit/', changefreq: 'monthly', priority: '0.9' },
    { path: '/booking/', changefreq: 'weekly', priority: '0.9' },
    { path: '/about/', changefreq: 'monthly', priority: '0.7' },
    { path: '/blog/', changefreq: 'weekly', priority: '0.8' },
    { path: '/privacy/', changefreq: 'yearly', priority: '0.2' },
    { path: '/terms/', changefreq: 'yearly', priority: '0.2' },
    { path: '/cookies/', changefreq: 'yearly', priority: '0.2' },
  ];

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

  const urls = [
    ...staticPages.map(
      (p) =>
        `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
    ),
    ...posts.map((post) => {
      const lastmod = post.modified
        ? `\n    <lastmod>${new Date(post.modified).toISOString()}</lastmod>`
        : '';
      return `  <url>\n    <loc>${SITE_URL}/${post.slug}/</loc>${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

  await writeFile(join(OUT_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`[sitemap] Wrote sitemap.xml with ${urls.length} URLs (${posts.length} posts).`);
}

main();
