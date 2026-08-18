import { Component, DOCUMENT, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { WpService } from '../../../shared/services/wp-service';
import { Header } from '../../../core/components/header/header';
import { Footer } from '../../../core/components/footer/footer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../shared/services/seo-service';
import { CtaBlock } from '../../../shared/components/cta-block/cta-block';
import { LocalePathPipe } from '../../../core/i18n/locale-path.pipe';
import { PostLanguageRouteService } from '../../../core/i18n/post-language-route.service';
import { htmlToText } from '../../../shared/utils/html-text';

type LightboxImage = { src: string; alt: string };

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer, TranslateModule, CtaBlock, LocalePathPipe],
  selector: 'app-blog-post-page',
  templateUrl: './blog-post-page.html',
  styleUrl: './blog-post-page.css',
})
export class BlogPostPage implements OnInit, OnDestroy {
  loading = true;
  post: any | null = null;
  lightboxImage: LightboxImage | null = null;
  private lightboxImages: LightboxImage[] = [];
  private lightboxIndex = 0;

  /** 'en' at the root (/slug/), 'hr' under the Croatian subtree (/hr/slug/). */
  private lang: 'en' | 'hr' = 'en';

  /**
   * Sibling articles rendered at the foot of the post. Without these, posts
   * only ever received a link from the blog index, so link equity had nowhere
   * to flow and readers had no next step inside the journal.
   */
  relatedPosts: any[] = [];
  readonly relatedCount = 4;

  private sub?: Subscription;
  private postLoadSub?: Subscription;
  private relatedSub?: Subscription;
  private postLoadVersion = 0;

  // Set once (or move to environment.ts)
  private readonly SITE_NAME = "Diocletian's Dream";
  private readonly SITE_URL = "https://diocletiansdream.com"; // change to your real domain
  private readonly ORG_NAME = "Diocletian's Dream";
  private readonly ORG_LOGO = "https://diocletiansdream.com/assets/images/ddLogo.png"; // use an absolute URL

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wp: WpService,
    private seo: SeoService,
    private translate: TranslateService,
    private postLanguageRoutes: PostLanguageRouteService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) return;
      // Angular reuses this component when EN and HR post routes change.
      // Refresh the language from the active route before every request.
      this.lang = this.route.snapshot.data['lang'] === 'hr' ? 'hr' : 'en';
      this.fetch(slug);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.postLoadSub?.unsubscribe();
    this.relatedSub?.unsubscribe();
    this.postLoadVersion++;
    this.postLanguageRoutes.clear();
    this.seo.clearJsonLd('ld-blogposting');
    this.seo.clearJsonLd('ld-breadcrumb');
  }

  fetch(slug: string): void {
    this.postLoadSub?.unsubscribe();
    const requestedRoute = this.router.url;
    const requestVersion = ++this.postLoadVersion;
    this.postLanguageRoutes.clear();
    this.loading = true;
    this.post = null;

    this.postLoadSub = this.wp.getPostBySlug(slug, this.lang).subscribe({
      next: (res) => {
        if (!this.isCurrentPostLoad(requestVersion, requestedRoute)) return;

        this.post = (res && res.length) ? res[0] : null;
        this.loading = false;

        if (this.post) {
          this.postLanguageRoutes.register(requestedRoute, this.post.translations);
          this.applySeo(this.post);
          this.loadRelated(this.post);
        } else {
          this.postLanguageRoutes.clear();
          this.relatedPosts = [];
          this.applyNotFoundSeo();
        }
      },
      error: () => {
        if (!this.isCurrentPostLoad(requestVersion, requestedRoute)) return;

        this.post = null;
        this.loading = false;
        this.postLanguageRoutes.clear();
        this.applyNotFoundSeo();
      },
    });
  }

  private isCurrentPostLoad(requestVersion: number, requestedRoute: string): boolean {
    return this.postLoadVersion === requestVersion && this.router.url === requestedRoute;
  }

  /** Unknown slug: render the not-found state as a real, noindex 404. */
  private applyNotFoundSeo(): void {
    this.seo.setTitle(this.translate.instant('pageNotFound.seo.metaTitle'));
    this.seo.setRobots(true);
    this.seo.setHttpStatus(404);
    this.seo.clearJsonLd('ld-blogposting');
    this.seo.clearJsonLd('ld-breadcrumb');
  }

  /** --- SEO core --- */
  private applySeo(post: any) {
    // English posts live at the root (/slug/); Croatian ones under /hr/slug/.
    const url = this.postUrl(this.lang, post?.slug ?? '');
    this.seo.clearHttpStatus();
    this.seo.setRobots();
    this.applyAlternates(post);

    // If you add SEO fields in WP (Yoast/RankMath/AIOSEO or ACF),
    // map them here. Fallback to title/excerpt.
    const title = this.pickSeoTitle(post);
    const description = this.pickSeoDescription(post);
    const image = this.featuredImage(post) ?? this.absoluteUrl('/assets/images/vr/peristyle-crowd.jpg');

    this.seo.setTitle(title);
    this.seo.setDescription(description);
    this.seo.setCanonical(url);
    this.seo.setOpenGraph({
      url,
      title,
      description,
      image,
      type: 'article',
      locale: this.lang === 'hr' ? 'hr_HR' : 'en_US',
    });

    // BlogPosting schema
    this.seo.setJsonLd('ld-blogposting', this.buildBlogPostingJsonLd(post, url, title, description, image));

    // Breadcrumb schema
    this.seo.setJsonLd('ld-breadcrumb', this.buildBreadcrumbJsonLd(post, url));
  }

  /** Absolute URL for a post in a given locale (/slug/ or /hr/slug/). */
  private postUrl(lang: 'en' | 'hr', slug: string): string {
    return this.absoluteUrl(lang === 'hr' ? `/hr/${slug}/` : `/${slug}/`);
  }

  /**
   * Reciprocal hreflang built from Polylang's `translations` map (lang ->
   * published slug, exposed by the dd-polylang-rest mu-plugin). Only emitted
   * when BOTH language versions are published: Google ignores one-way
   * annotations, and a href to a missing translation would 404. Otherwise the
   * alternates are cleared (they survive client-side navigation).
   */
  private applyAlternates(post: any): void {
    const t = post?.translations ?? {};
    const enSlug = typeof t.en === 'string' ? t.en : null;
    const hrSlug = typeof t.hr === 'string' ? t.hr : null;

    if (enSlug && hrSlug) {
      const en = this.postUrl('en', enSlug);
      const hr = this.postUrl('hr', hrSlug);
      this.seo.setAlternates([
        { hreflang: 'en', href: en },
        { hreflang: 'hr', href: hr },
        { hreflang: 'x-default', href: en },
      ]);
    } else {
      this.seo.clearAlternates();
    }
  }

  /**
   * The Yoast SEO-title field is authored per post and on a few Croatian
   * translations it was left in English — /hr/vr-iskustvo-dioklecijanova-palaca/
   * shipped "VR Experience in Split: Discover Diocletian's Palace" over Croatian
   * body copy. On hr we therefore accept that field only when it is actually
   * built on the post's own (translated) title, and otherwise fall back to
   * Yoast's og_title, which follows the translated title. English posts keep
   * their authored SEO title untouched: those pages are indexed as-is.
   */
  private pickSeoTitle(post: any): string {
    // Try plugin fields first (examples). Adjust to your WP payload.
    const authored = this.stripHtml(
      post?.yoast_head_json?.title ||
      post?.rank_math_seo?.title ||
      post?.aioseo?.title ||
      ''
    ).trim();

    const localized = this.stripHtml(post?.yoast_head_json?.og_title || post?.title?.rendered || '').trim();

    if (authored && (this.lang !== 'hr' || this.derivesFrom(authored, localized))) return authored;
    if (localized) return this.withSiteName(localized);
    return authored || this.SITE_NAME;
  }

  /**
   * Whether the authored SEO title grew out of the post's own title (Yoast's
   * default is the title plus a site-name suffix) rather than being a leftover
   * from the other language. A short prefix is enough to tell the languages
   * apart without tripping on separators the editor added mid-title.
   */
  private derivesFrom(authored: string, localized: string): boolean {
    const key = this.normalizeTitle(localized).slice(0, 15);
    return !!key && this.normalizeTitle(authored).includes(key);
  }

  private normalizeTitle(value: string): string {
    return value.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
  }

  /** Brands the title, unless it already carries the site name. */
  private withSiteName(title: string): string {
    return /diocletian['’]?s\s+dream/i.test(title) ? title : `${title} | ${this.SITE_NAME}`;
  }

  private pickSeoDescription(post: any): string {
    const pluginDesc =
      post?.yoast_head_json?.description ||
      post?.rank_math_seo?.description ||
      post?.aioseo?.description;

    // Fallback: excerpt -> first ~160 chars
    const excerpt = this.stripHtml(post?.excerpt?.rendered ?? '');
    const base = pluginDesc ? this.stripHtml(pluginDesc) : excerpt;

    const trimmed = (base || '').trim();
    if (!trimmed) return this.translate.instant('blogPage.seo.metaDescription');

    return trimmed.length > 160 ? trimmed.slice(0, 157).trimEnd() + '…' : trimmed;
  }

  /**
   * The WordPress author, from the `_embedded` payload `_embed=true` already
   * fetches. Returns null when WordPress gives us nothing usable or only the
   * generic "admin" account: a `Person` node naming an account rather than a
   * human is worse than no author node at all, because it asserts an entity
   * that cannot be verified anywhere off-site.
   */
  authorName(post: any): string | null {
    const raw = this.stripHtml(post?._embedded?.author?.[0]?.name ?? '').trim();
    if (!raw) return null;
    if (/^(admin|administrator|editor|user)$/i.test(raw)) return null;
    // A social handle ("@diocletiansdream") or the brand name itself is an
    // account, not a person. Asserting a Person for either claims an entity
    // that cannot be verified off-site, which scores worse than attributing
    // the article to the organisation.
    if (raw.startsWith('@')) return null;
    if (/^diocletian'?s\s*dream$/i.test(raw.replace(/[’']/g, "'"))) return null;
    return raw;
  }

  /**
   * Byline shown to the reader. Real people get their name; otherwise the
   * article is attributed to the brand, matching the Organization author node
   * in the schema graph rather than printing a WordPress handle.
   */
  bylineName(post: any): string {
    return this.authorName(post) ?? this.ORG_NAME;
  }

  /** Whether the post was meaningfully revised after publication (1 day+ apart). */
  wasUpdated(post: any): boolean {
    const published = new Date(post?.date).getTime();
    const modified = new Date(post?.modified).getTime();
    if (isNaN(published) || isNaN(modified)) return false;
    return modified - published > 24 * 60 * 60 * 1000;
  }

  /** Localized "last updated" label, formatted like the publish date. */
  modifiedLabel(post: any): string {
    const d = new Date(post?.modified);
    if (isNaN(d.getTime())) return '';
    const locale = this.lang === 'hr' ? 'hr-HR' : undefined;
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: '2-digit' });
  }

  /**
   * Author node for the schema graph. Falls back to the Organization when
   * WordPress has no real name attached, which keeps the article valid without
   * inventing a byline.
   */
  private authorNode(post: any) {
    const name = this.authorName(post);
    const url = this.stripHtml(post?._embedded?.author?.[0]?.url ?? '').trim();

    if (!name) {
      return { '@type': 'Organization', '@id': `${this.SITE_URL}/#organization` };
    }

    return {
      '@type': 'Person',
      '@id': `${this.SITE_URL}/#/author/${encodeURIComponent(name.toLowerCase())}`,
      name,
      ...(url ? { url } : {}),
      worksFor: { '@type': 'Organization', '@id': `${this.SITE_URL}/#organization` },
    };
  }

  private buildBlogPostingJsonLd(post: any, url: string, title: string, description: string, image: string) {
    const published = post?.date ? new Date(post.date).toISOString() : undefined;
    const modified = post?.modified ? new Date(post.modified).toISOString() : published;
    const body = this.stripHtml(this.contentHtml(post));

    const publisher = {
      '@type': 'Organization',
      '@id': `${this.SITE_URL}/#organization`,
      name: this.ORG_NAME,
      url: `${this.SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: this.ORG_LOGO,
      },
    };

    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      headline: this.stripHtml(title).slice(0, 110),
      description: this.stripHtml(description),
      image: image ? [image] : undefined,
      datePublished: published,
      dateModified: modified,
      inLanguage: this.lang === 'hr' ? 'hr-HR' : 'en-US',
      wordCount: body ? body.split(/\s+/).filter(Boolean).length : undefined,
      author: this.authorNode(post),
      publisher,
      /** The article body, so voice assistants read the piece and not the nav. */
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['#post-article h1', '#post-article .blog-prose p'],
      },
      /** Ties the post to the blog index, which ties it to the site. */
      isPartOf: {
        '@type': 'Blog',
        '@id': this.absoluteUrl(this.lang === 'hr' ? '/hr/blog/' : '/blog/'),
        name: this.translate.instant('blogPage.hero.title'),
        publisher: { '@id': `${this.SITE_URL}/#organization` },
      },
      about: { '@id': `${this.SITE_URL}/#localbusiness` },
    };
  }

  private buildBreadcrumbJsonLd(post: any, url: string) {
    const home = this.lang === 'hr' ? '/hr/' : '/';
    const blog = this.lang === 'hr' ? '/hr/blog/' : '/blog/';
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: this.translate.instant('header.nav.home'),
          item: this.absoluteUrl(home),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: this.translate.instant('header.nav.blog'),
          item: this.absoluteUrl(blog),
        },
        { '@type': 'ListItem', position: 3, name: this.titleText(post), item: url }
      ]
    };
  }

  private absoluteUrl(path: string): string {
    // Ensure exactly one slash between
    return `${this.SITE_URL.replace(/\/+$/, '')}/${(path || '').replace(/^\/+/, '')}`;
  }

  /** --- Existing helpers --- */
  /**
   * Picks siblings for the "keep reading" list: posts sharing a category first,
   * then the rest of the archive to top up. Same language only — the Croatian
   * and English trees are separate sites as far as crawlers are concerned.
   *
   * The window into that pool is rotated by the post's own position. Taking a
   * plain `slice(0, 4)` would hand every article in a category the identical
   * four links, so a handful of posts would collect all the internal links and
   * the rest none — the problem this block exists to solve. Rotating spreads
   * incoming links across the archive and stays deterministic, which matters
   * because these pages are prerendered.
   */
  private loadRelated(post: any): void {
    this.relatedSub?.unsubscribe();
    this.relatedSub = this.wp.getPosts(1, 100, this.lang).subscribe({
      next: (posts) => {
        const all = (posts ?? []).filter((p: any) => p?.slug);
        const pool = all.filter((p: any) => p?.id !== post?.id);
        if (!pool.length) {
          this.relatedPosts = [];
          return;
        }

        const categories: number[] = post?.categories ?? [];
        const shares = (p: any) => (p?.categories ?? []).some((c: number) => categories.includes(c));
        const ordered = [...pool.filter(shares), ...pool.filter((p: any) => !shares(p))];

        const offset = Math.max(0, all.findIndex((p: any) => p?.id === post?.id));
        this.relatedPosts = Array.from(
          { length: Math.min(this.relatedCount, ordered.length) },
          (_, i) => ordered[(offset + i) % ordered.length],
        );
      },
      error: () => {
        this.relatedPosts = [];
      },
    });
  }

  /** Lang-aware post link: /slug on English, /hr/slug under the Croatian tree. */
  postLink(post: any): any[] {
    return this.lang === 'hr' ? ['/hr', post?.slug] : ['/', post?.slug];
  }

  featuredImage(post: any): string | null {
    return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
  }

  /**
   * Decodes entities as well as stripping tags. Yoast returns titles like
   * "Who was Diocletian? - Diocletian&#039;s Dream"; left encoded, Title/Meta
   * escape the ampersand and the page ships "Diocletian&amp;#039;s Dream".
   */
  stripHtml(html: string): string {
    return htmlToText(html);
  }

  titleText(post: any): string {
    return this.stripHtml(post?.title?.rendered ?? '');
  }

  /**
   * Croatian pages spell the month out in Croatian; English ones keep following
   * the visitor's own locale, as they always have.
   */
  dateLabel(post: any): string {
    const d = new Date(post?.date);
    if (isNaN(d.getTime())) return '';
    const locale = this.lang === 'hr' ? 'hr-HR' : undefined;
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: '2-digit' });
  }

  contentHtml(post: any): string {
    return post?.content?.rendered ?? '';
  }

  /** Handles images inserted through [innerHTML] without turning them into router links. */
  onPostImageClick(event: MouseEvent): void {
    const image = (event.target as HTMLElement | null)?.closest?.('img') as HTMLImageElement | null;
    const article = image?.closest<HTMLElement>('#post-article');
    if (!image || !article) return;

    event.preventDefault();
    event.stopPropagation();
    this.lightboxImages = Array.from(article.querySelectorAll('img')).map((item) => ({
      src: item.currentSrc || item.src,
      alt: item.getAttribute('alt')?.trim() || 'Gallery image',
    }));
    this.lightboxIndex = Math.max(0, this.lightboxImages.findIndex((item) => item.src === (image.currentSrc || image.src)));
    this.lightboxImage = this.lightboxImages[this.lightboxIndex] ?? null;
  }

  onLightboxBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeLightbox();
  }

  closeLightbox(): void {
    this.lightboxImage = null;
    this.lightboxImages = [];
    this.lightboxIndex = 0;
  }

  previousLightboxImage(): void {
    this.moveLightboxImage(-1);
  }

  nextLightboxImage(): void {
    this.moveLightboxImage(1);
  }

  hasLightboxNavigation(): boolean {
    return this.lightboxImages.length > 1;
  }

  lightboxPosition(): string {
    return `${this.lightboxIndex + 1} / ${this.lightboxImages.length}`;
  }

  @HostListener('document:keydown', ['$event'])
  onLightboxKeydown(event: KeyboardEvent): void {
    if (!this.lightboxImage) return;

    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousLightboxImage();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextLightboxImage();
    }
  }

  private moveLightboxImage(direction: -1 | 1): void {
    if (this.lightboxImages.length < 2) return;
    this.lightboxIndex = (this.lightboxIndex + direction + this.lightboxImages.length) % this.lightboxImages.length;
    this.lightboxImage = this.lightboxImages[this.lightboxIndex];
  }

}
