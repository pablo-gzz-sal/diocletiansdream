# Diocletians Dream VR Museum

Website for **Diocletians Dream** — a 15-minute virtual reality museum experience that brings Diocletians Palace back to life in 305 AD, located just outside the palace walls near the Golden Gate in Split, Croatia.

**Live site:** https://diocletiansdream.com

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 20 (standalone components) |
| Styling | Tailwind CSS v4 + PostCSS |
| Language | TypeScript 5.9 |
| Animations | GSAP 3.14 + CSS animations |
| i18n | @ngx-translate/core v17 (EN / HR) |
| Blog CMS | WordPress (headless, REST API) |
| Booking | Turitop widget (embedded) |
| Fonts | Cormorant Garamond (serif) + DM Sans (sans) via Google Fonts |

---

## Project Structure

```
src/
├── app/
│   ├── app.routes.ts               # All page routes
│   ├── app.config.ts               # App config, i18n setup
│   ├── core/
│   │   ├── components/             # Reusable page sections
│   │   │   ├── header/             # Fixed nav + mobile menu
│   │   │   ├── footer/             # Footer with social links
│   │   │   ├── hero/               # Hero with animated H1
│   │   │   ├── experience/         # Bento grid section
│   │   │   ├── highlights/         # Marquee strip
│   │   │   ├── reviews/            # Testimonials
│   │   │   ├── visit/              # Unique cards + location
│   │   │   ├── faq/                # Accordion FAQ
│   │   │   └── about-project/      # Story section
│   │   └── i18n/                   # Custom JSON translate loader
│   ├── features/                   # Full pages
│   │   ├── landing-page/           # Home
│   │   ├── experience/             # Experience detail
│   │   ├── about/                  # About the project
│   │   ├── booking/                # Ticket booking (Turitop)
│   │   ├── contact/                # Visit / contact info
│   │   ├── blog/
│   │   │   ├── blog-list-page/     # Blog listing + filters
│   │   │   └── blog-post-page/     # Individual post (WP content)
│   │   └── legal/                  # Privacy, Terms, Cookies
│   └── shared/
│       ├── components/
│       │   ├── blog-invite/        # CTA block linking to blog
│       │   ├── cta-block/          # Generic CTA section
│       │   └── intro-reveal/       # Intro animation overlay
│       ├── animations/
│       │   └── reveal-on-scroll-directive.ts
│       └── services/
│           ├── seo-service.ts      # Meta tags, canonical, JSON-LD
│           └── wp-service.ts       # WordPress REST API client
├── assets/
│   ├── images/                     # ddLogo.png, heroAnimation.jpg
│   └── i18n/
│       ├── en.json                 # English translations
│       └── hr.json                 # Croatian translations
├── styles.css                      # Global styles + CSS design tokens
└── index.html                      # Root HTML with meta/OG tags
public/
├── favicon.ico
├── robots.txt
└── sitemap.xml
```

---

## Getting Started

Prerequisites: Node 20 or newer and npm. Nothing else needs to be installed
globally — the Angular CLI comes from the project's own dependencies, so use
`npx ng …` rather than a system-wide `ng`.

```bash
git clone <repo-url> diocletiansdream
cd diocletiansdream
npm install
npm start                 # dev server at http://localhost:4200
```

There are no secrets and no `.env` file. Every environment value lives in
`src/environments/environment.ts`:

| Key | Meaning |
|---|---|
| `wpBaseUrl` | Headless WordPress host. Change this if the CMS moves. |
| `siteUrl` | Public site origin. Used for canonicals, hreflang and the sitemap. |
| `siteIndexable` | `true` in production. Set to `false` to make every page emit `noindex, nofollow` (used before launch, or for a staging copy). |

The dev server renders in the browser only. It is fine for building pages, but
it does not exercise prerendering, so anything SEO-related (titles, meta tags,
canonicals, JSON-LD) has to be checked against a real build — see
[Local preview of the real build](#local-preview-of-the-real-build).

### Commands

| Command | What it does |
|---|---|
| `npm start` | Dev server on port 4200. |
| `npm run build` | Production build plus sitemap. Output in `dist/diocletiansdream/browser/`. This is what gets deployed. |
| `npm test` | Unit tests (Karma + Jasmine). Needs a Chrome binary, see below. |
| `npm run watch` | Development build that rebuilds on change. Rarely needed. |

### Running the tests

Karma needs a Chrome-family browser. If Google Chrome is not installed, point
`CHROME_BIN` at whatever is available (Brave and Edge both work):

```bash
CHROME_BIN="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npx ng test --watch=false --browsers=ChromeHeadless
```

### Local preview of the real build

To check what actually ships, serve the build output as static files:

```bash
npm run build
npx http-server dist/diocletiansdream/browser -p 4321 -c-1
```

Then open http://localhost:4321. This serves the prerendered HTML, so the page
titles, meta tags and Croatian routes behave exactly as they will in production.

---

## WordPress (headless CMS)

Blog content comes from WordPress at `cms.diocletiansdream.com`. The Angular app
never writes to it — it reads the REST API at build time (to prerender each post)
and at runtime (for posts published since the last build).

Plugins the site depends on:

- **Yoast SEO** — supplies `yoast_head_json` (SEO title, meta description, OG
  fields) for each post.
- **Elementor** — post bodies are Elementor markup; the app injects them as HTML.
- **Polylang** — provides the Croatian translations of each post.
- **`dd-polylang-rest`** — a small must-use plugin kept in this repo at
  `wordpress/mu-plugins/dd-polylang-rest.php`. Polylang's free edition does not
  expose language data over REST, so without this plugin `?lang=en` and
  `?lang=hr` both return every post in every language and the build prerenders
  each post twice under the wrong URLs. It must live in
  `wp-content/mu-plugins/` on the CMS host (note the folder name — a typo there
  means WordPress silently ignores it).

Do not strip the CMS down to "just Polylang". Removing Yoast or Elementor breaks
post SEO and post rendering respectively.

Two things to know when editing content:

- **Every REST request must pass `?lang=`.** With the must-use plugin active, a
  request without it returns all languages mixed together.
- **Yoast's SEO-title field is per post and is not translated automatically.**
  A few Croatian posts were published with the English SEO title still in the
  field. The app compensates (`pickSeoTitle` in `blog-post-page.ts` falls back to
  the translated title on Croatian routes), but fixing the field in Yoast is the
  cleaner solution.

Check the raw payload before suspecting the Angular code:

```bash
curl -s "https://cms.diocletiansdream.com/wp-json/wp/v2/posts?slug=<slug>&lang=hr" | head -c 2000
```

---

## Design System

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `--dd-purple` | `#2d046a` | Primary accent — buttons, hover states, links, active nav |
| `--dd-gold` | `#c29a59` | Secondary accent — dividers, micro-details, hover highlights |
| `--color-cream` | `#f5f0e8` | Primary background |
| `--color-sand` | `#ede7d9` | Section backgrounds |
| `--color-ink` | `#1a1814` | Primary text / dark surfaces |

> **Color rule:** Purple and gold are identity accents, not large background surfaces.

### Typography

| Role | Font | Token |
|---|---|---|
| Headings | Cormorant Garamond | `--font-serif` |
| Body / UI | DM Sans | `--font-sans` |

### Type Scale

| Element | Size |
|---|---|
| Hero H1 | `clamp(2.75rem, 7vw, 5.5rem)` (44–88px) |
| Section H2 | `clamp(2.625rem, 4.5vw, 3.25rem)` (42–52px) |
| Body | 16–18px |

### Key CSS Variables

All design tokens live in `src/styles.css` under `:root`:

```css
--radius-xl:   1.125rem   /* Cards, bento cells */
--radius-lg:   1rem        /* Images inside cards */
--radius-md:   0.75rem     /* Smaller elements */
--radius-pill: 100px       /* Buttons */
```

---

## Internationalisation

The site supports **English (en)** and **Croatian (hr)**.

- Translation files: `src/assets/i18n/en.json` and `src/assets/i18n/hr.json`
- Default language: `en` (set in `src/app/app.config.ts`)
- The language toggle in the header switches between EN and HR at runtime
- All UI strings use the `| translate` pipe or `TranslateService`

---

## SEO

- **`SeoService`** (`src/app/shared/services/seo-service.ts`) manages title, description, canonical URL, Open Graph tags, and JSON-LD structured data
- Each feature page calls `seo.setTitle()`, `seo.setDescription()`, `seo.setCanonical()`, and `seo.setOpenGraph()` in `ngOnInit`
- The landing page adds JSON-LD for `LocalBusiness` + `TouristAttraction` schema
- `robots.txt` is a static file in `public/`; `sitemap.xml` is generated at build time by `scripts/generate-sitemap.mjs`
- Because pages are prerendered, crawlers receive fully-rendered HTML (title, meta, canonical, OG, JSON-LD) with no need to execute JS

---

## Blog Integration

Blog content is fetched from a headless WordPress instance via `WpService` (`src/app/shared/services/wp-service.ts`). Posts are rendered in `blog-post-page` using `[innerHTML]` with styles applied via the global `.blog-prose` class in `src/styles.css`.

---

## Booking

Ticket booking is handled by the **Turitop** widget. The script is loaded in `src/index.html` (company `D560`) and the widget is embedded on the `/booking` page via a `<div class="load-turitop">` element.

---

## Deployment

The site is prerendered: `npm run build` renders every public page to static HTML,
so SiteGround serves plain files and there is no Node process in production. The
`.htaccess` in `public/` (copied into the build output) does the routing work —
trailing-slash canonicalisation, the legacy `/blog/<slug>` → `/<slug>/` 301s, a
client-render fallback for posts published since the last build, and
`ErrorDocument 404` → the prerendered `/404/` page.

Post slugs are fetched from WordPress during the build
(`fetchAllPostSlugs` in `src/app/app.routes.server.ts`), which is why the CMS has
to be reachable when you build.

### 1. Build

```bash
npm run build
```

Read the output before going any further. Two numbers matter:

```
Prerendered 76 static routes.
[sitemap] Wrote sitemap.xml with 73 URLs (29 en posts, 29 hr posts).
[sitemap] Verified all 73 sitemapped pages prerendered as indexable.
```

18 of those routes are fixed pages; the rest is one file per blog post, English
and Croatian. A route count near 18 means the build could not reach WordPress and
contains no blog posts at all.

Always build with `npm run build`, never with a bare `ng build`. The sitemap
script that runs afterwards is what refuses a post-less build (`FATAL: WordPress
returned no English posts`) and what catches reserved slugs. On its own, `ng build`
prints a prerender error, then finishes successfully and leaves you with a
gutted build that looks fine.

### 2. Zip the output

Zip the *contents* of the browser folder, not the folder itself, and keep hidden
files so `.htaccess` is included:

```bash
cd dist/diocletiansdream/browser
zip -rq ../site.zip . -x '.DS_Store'
```

### 3. Upload through SiteGround

1. Site Tools → Site → File Manager, open `diocletiansdream.com/public_html`.
2. Delete the previous build's files (keep the folder itself). DO NOT DELETE well-known FOLDER. The rest can be deleted 
3. Upload `site.zip` and use Extract.
4. SiteGround extracts into a subfolder named after the zip, so you end up with
   `public_html/site/`. Open it, select all including hidden files, Move to
   `/diocletiansdream.com/public_html`, then delete the empty `site` folder and
   `site.zip`.
5. Confirm `.htaccess` is directly in `public_html`. Hidden files are sometimes
   skipped by the extractor. If it is missing, recreate it by copying
   `public/.htaccess` from this repo — without it, every URL except the homepage
   breaks.

### 4. Verify

```bash
curl -o /dev/null -s -w "%{http_code} %{redirect_url}\n" https://diocletiansdream.com/
curl -o /dev/null -s -w "%{http_code} %{redirect_url}\n" https://diocletiansdream.com/experience
curl -o /dev/null -s -w "%{http_code} %{redirect_url}\n" https://diocletiansdream.com/hr/blog/
curl -o /dev/null -s -w "%{http_code} %{redirect_url}\n" https://diocletiansdream.com/definitely-not-a-page/
```

Expected: `200` for the homepage and `/hr/blog/`, `301` to the trailing-slash URL
for `/experience`, `404` for the unknown URL. Also open one English and one
Croatian blog post and check the browser tab title is in the right language.

### Publishing a new blog post

Publish in WordPress as usual, in both languages if the post should exist in
Croatian. The post is reachable at its URL straight away through the client-render
fallback, but it has no prerendered HTML and is absent from the sitemap until the
site is rebuilt and re-uploaded. Run through the four steps above whenever you
want new posts baked in properly.

One rule when creating posts: **never use `hr` or `dd-thankyou` as a slug.** The
blog route is a single-segment wildcard, so such a post would collide with the
Croatian section or the booking confirmation page. The sitemap script fails the
build if it finds one.

---

## Troubleshooting

**The build prerenders only ~18 routes, or stops with `FATAL: WordPress returned
no English posts`.** The CMS was unreachable, so no post slugs were fetched.
Check it directly:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://cms.diocletiansdream.com/wp-json/wp/v2/posts?per_page=1&lang=en"
```

`200` means the CMS is fine. Anything else, most often `202` with an HTML body
mentioning `sgcaptcha`, means SiteGround's bot protection has challenged your IP.
That happens after a burst of automated requests to the CMS. It clears on its own
after a while; you can also allow the IP under Site Tools → Security on the CMS
site. Rebuild once the check returns `200`.

**A blog post shows the "not found" state.** The slug does not exist in the
language you are viewing. Croatian posts have their own slugs — `/hr/tko-je-bio-dioklecijan/`,
not `/hr/who-was-diocletian/`.

**Both languages show all the posts mixed together.** The `dd-polylang-rest`
must-use plugin is not active on the CMS. See the WordPress section above.

**Everything 404s after a deploy.** `.htaccess` did not make it into
`public_html`. Re-upload it from `public/.htaccess`.

**Sitemap or canonicals point at the wrong domain.** Check `siteUrl` in
`src/environments/environment.ts`; it is the single source of truth for both.
