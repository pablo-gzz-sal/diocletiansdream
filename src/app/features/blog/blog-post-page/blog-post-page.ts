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

  private sub?: Subscription;
  private postLoadSub?: Subscription;
  private postLoadVersion = 0;

  // Set once (or move to environment.ts)
  private readonly SITE_NAME = "Diocletians Dream";
  private readonly SITE_URL = "https://diocletiansdream.com"; // change to your real domain
  private readonly ORG_NAME = "Diocletians Dream";
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
        } else {
          this.postLanguageRoutes.clear();
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

  private buildBlogPostingJsonLd(post: any, url: string, title: string, description: string, image: string) {
    const published = post?.date ? new Date(post.date).toISOString() : undefined;
    const modified = post?.modified ? new Date(post.modified).toISOString() : published;

    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      headline: this.stripHtml(title),
      description: this.stripHtml(description),
      image: image ? [image] : undefined,
      datePublished: published,
      dateModified: modified,
      author: {
        '@type': 'Organization',
        name: this.ORG_NAME,
        url: this.SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: this.ORG_LOGO,
        },
      },
      publisher: {
        '@type': 'Organization',
        name: this.ORG_NAME,
        url: this.SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: this.ORG_LOGO,
        },
      }
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
