import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment';

const browserDistFolder = join(import.meta.dirname, '../browser');

const SITE_URL = environment.siteUrl.replace(/\/+$/, '');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Serve static files from /browser (JS, CSS, images, robots.txt, favicon, ...).
 * Real files are returned here; everything else falls through to the SEO
 * middleware and the Angular renderer below.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Dynamic sitemap: static pages + every WordPress blog post, all as
 * trailing-slash root URLs (matching the site's canonical form).
 */
app.get('/sitemap.xml', async (_req, res) => {
  const staticPages: Array<{ path: string; changefreq: string; priority: string }> = [
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

  let posts: Array<{ slug: string; modified?: string }> = [];
  try {
    const api = `${environment.wpBaseUrl}/wp-json/wp/v2/posts?per_page=100&_fields=slug,modified`;
    const resp = await fetch(api);
    if (resp.ok) posts = await resp.json();
  } catch {
    // If WordPress is unreachable, still emit the static pages.
  }

  const urls = [
    ...staticPages.map(
      (p) =>
        `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
    ),
    ...posts.map((post) => {
      const lastmod = post.modified ? `\n    <lastmod>${new Date(post.modified).toISOString()}</lastmod>` : '';
      return `  <url>\n    <loc>${SITE_URL}/${post.slug}/</loc>${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  res.header('Content-Type', 'application/xml').send(xml);
});

/**
 * Legacy /blog/:slug URLs → new root URL, permanently.
 */
app.get('/blog/:slug', (req, res, next) => {
  const slug = req.params.slug;
  if (!slug) return next();
  return res.redirect(301, `/${slug}/`);
});

/**
 * Enforce the trailing-slash canonical form. Any GET/HEAD page request without
 * a trailing slash (and that isn't a file) is 301'd to the slash version.
 */
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const [path, query = ''] = req.url.split('?');
  const lastSegment = path.split('/').pop() ?? '';
  const isFile = lastSegment.includes('.');
  if (path !== '/' && !path.endsWith('/') && !isFile) {
    return res.redirect(301, `${path}/${query ? `?${query}` : ''}`);
  }
  return next();
});

/**
 * Render the Angular application. A page that marks itself as a 404 (via the
 * SeoService `ssr-status-code` meta tag) is promoted to a real HTTP 404 so
 * unknown URLs never return 200 with the homepage shell.
 */
app.use(async (req, res, next) => {
  try {
    const response = await angularApp.handle(req);
    if (!response) return next();

    const html = await response.text();
    let status = response.status;
    if (status === 200 && /name="ssr-status-code"/.test(html)) {
      status = 404;
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length'); // recomputed when the new body is written
    await writeResponseToNodeResponse(new Response(html, { status, headers }), res);
  } catch (err) {
    next(err);
  }
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
