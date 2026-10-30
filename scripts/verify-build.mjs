// Sanity-checks the prerendered output before it is packaged or deployed.
//
// A build with no blog posts is still a *valid* Angular build: it exits 0 and
// produces every static page. Deployed, it is a site whose entire blog 404s.
// The prerender guard in app.routes.server.ts catches an unreachable CMS, and
// this checks the artifact itself, so a build can only ship if the posts and
// their SEO markers actually came out right.
//
// Run after `npm run build`:  node scripts/verify-build.mjs

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(root, 'dist/diocletiansdream/browser');

/**
 * Directories that come from fixed routes rather than blog slugs. The Croatian
 * ones are the translated paths (HR_SLUGS in core/i18n/locale-url.ts) — miss
 * one and it gets miscounted as a blog post, which would let a build with no
 * posts at all satisfy MIN_POSTS below.
 */
const STATIC_DIRS = new Set([
  '404', 'about', 'blog', 'booking', 'cookies', 'dd-thankyou',
  'experience', 'hr', 'privacy', 'terms', 'visit',
]);

const STATIC_HR_DIRS = new Set([
  '404', 'blog', 'iskustvo', 'o-nama', 'posjet', 'rezervacija',
]);

/** The only pages allowed to carry the SSR 404 marker. */
const MAY_BE_404 = new Set(['404/index.html', 'hr/404/index.html']);

const MIN_POSTS = 3;

/** Every index.html under dir, as paths relative to OUT_DIR. */
async function findPages(dir, prefix = '') {
  const pages = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) pages.push(...(await findPages(join(dir, entry.name), rel)));
    else if (entry.name === 'index.html') pages.push(rel);
  }
  return pages;
}

const fail = (msg) => {
  console.error(`[verify-build] ${msg}`);
  process.exitCode = 1;
};

async function main() {
  if (!existsSync(OUT_DIR)) {
    fail(`Output folder not found: ${OUT_DIR}. Run "npm run build" first.`);
    return;
  }

  const pages = await findPages(OUT_DIR);

  // Blog posts prerender to a top-level (or /hr/) directory named for the slug.
  const posts = pages.filter((p) => {
    const parts = p.split('/');
    if (parts.length === 2) return !STATIC_DIRS.has(parts[0]);
    return parts.length === 3 && parts[0] === 'hr' && !STATIC_HR_DIRS.has(parts[1]);
  });

  if (posts.length < MIN_POSTS) {
    fail(
      `Only ${posts.length} blog post page(s) prerendered (expected at least ` +
        `${MIN_POSTS}). The CMS was probably unreachable — this artifact would ` +
        `deploy a site with no blog.`
    );
  }

  // A post that rendered its not-found state is baked as noindex + 404. That
  // deploys as a permanently deindexed post, so treat it as a failed build.
  for (const page of pages) {
    if (MAY_BE_404.has(page)) continue;
    const html = await readFile(join(OUT_DIR, page), 'utf8');
    if (html.includes('name="ssr-status-code" content="404"')) {
      fail(`${page} is marked as a 404 but is not a 404 page.`);
    }
  }

  // A page's source may only carry that page's own content. Text from other
  // pages or articles has twice slipped into the hidden page data, unnoticed
  // because it is invisible in the browser and every other check still passes.
  for (const page of pages) {
    if (MAY_BE_404.has(page) || page === 'dd-thankyou/index.html') continue;
    const html = await readFile(join(OUT_DIR, page), 'utf8');
    const state = html.match(/<script id="ng-state"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
    const head = html.match(/<head>[\s\S]*?<\/head>/)?.[0] ?? '';

    if (/assets\/i18n|experiencePage|bookingPage|cookieBanner/.test(state)) {
      fail(`${page} ships the whole translation file in its page data.`);
    }
    if (/yoast_head(?!_json)|_links|"schema"|&q;schema&q;/.test(state)) {
      fail(`${page} ships raw WordPress data (Yoast or REST links) in its page data.`);
    }
    if (posts.includes(page) && (state.match(/"slug"|&q;slug&q;/g) ?? []).length > 5) {
      fail(`${page} ships other articles in its page data (only 4 related cards are allowed).`);
    }
    if (posts.includes(page) && /"content"|&q;content&q;/.test(state)) {
      fail(`${page} ships its article body a second time in its page data.`);
    }
    if (/<!--/.test(head)) fail(`${page} has developer comments in its <head>.`);
    if (/rel="preconnect"[^>]*player\.vimeo\.com/.test(head) && page !== 'index.html' && page !== 'hr/index.html') {
      fail(`${page} preconnects to Vimeo, which only the home page uses.`);
    }
  }

  for (const required of ['.htaccess', 'robots.txt', 'sitemap.xml']) {
    if (!existsSync(join(OUT_DIR, required))) fail(`Missing ${required} in the build output.`);
  }

  if (!process.exitCode) {
    console.log(
      `[verify-build] OK — ${pages.length} pages, ${posts.length} blog posts, ` +
        `no stray 404 markers.`
    );
  }
}

await main();
