# Diocletian's Dream VR Museum

Website for **Diocletian's Dream** — a 15-minute virtual reality museum experience that brings Diocletian's Palace back to life in 305 AD, located just outside the palace walls near the Golden Gate in Split, Croatia.

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

**Prerequisites:** Node 20+

```bash
npm install
ng serve          # Dev server at http://localhost:4200
ng build          # Production build -> dist/diocletiansdream/browser/
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
- Static files: `public/robots.txt` and `public/sitemap.xml`
- Base meta/OG tags in `src/index.html` serve as fallback for crawlers before Angular hydrates

---

## Blog Integration

Blog content is fetched from a headless WordPress instance via `WpService` (`src/app/shared/services/wp-service.ts`). Posts are rendered in `blog-post-page` using `[innerHTML]` with styles applied via the global `.blog-prose` class in `src/styles.css`.

---

## Booking

Ticket booking is handled by the **Turitop** widget. The script is loaded in `src/index.html` (company `D560`) and the widget is embedded on the `/booking` page via a `<div class="load-turitop">` element.

---

## Deployment

The app builds to `dist/diocletiansdream/browser/` as a static SPA. All routes must redirect to `index.html` on your hosting provider (Nginx, Netlify, Vercel, etc.).
