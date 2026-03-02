import { Component, DOCUMENT, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { WpService } from '../../../shared/services/wp-service';
import { Header } from '../../../core/components/header/header';
import { Footer } from '../../../core/components/footer/footer';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../shared/services/seo-service';
import { CtaBlock } from '../../../shared/components/cta-block/cta-block';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer, TranslateModule, CtaBlock],
  selector: 'app-blog-post-page',
  templateUrl: './blog-post-page.html',
})
export class BlogPostPage implements OnInit, OnDestroy {
  loading = true;
  post: any | null = null;

  private sub?: Subscription;

  // Set once (or move to environment.ts)
  private readonly SITE_NAME = "Diocletian’s Dream";
  private readonly SITE_URL = "https://diocletiansdream.com"; // change to your real domain
  private readonly ORG_NAME = "Diocletian’s Dream";
  private readonly ORG_LOGO = "https://diocletiansdream.com/assets/images/ddLogo.png"; // use an absolute URL

  constructor(
    private route: ActivatedRoute,
    private wp: WpService,
    private seo: SeoService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);

    this.sub = this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) return;
      this.fetch(slug);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.seo.clearJsonLd('ld-blogposting');
    this.seo.clearJsonLd('ld-breadcrumb');
  }

  fetch(slug: string): void {
    this.loading = true;
    this.post = null;

    this.wp.getPostBySlug(slug).subscribe({
      next: (res) => {
        this.post = (res && res.length) ? res[0] : null;
        this.loading = false;

        if (this.post) this.applySeo(this.post);
      },
      error: () => {
        this.post = null;
        this.loading = false;

        // Optional: set a simple noindex meta on 404 state if you render it
        // this.seo.meta.updateTag({ name: 'robots', content: 'noindex,follow' });
      },
    });
  }

  /** --- SEO core --- */
  private applySeo(post: any) {
    const url = this.absoluteUrl(`/blog/${post?.slug ?? ''}`);

    // If you add SEO fields in WP (Yoast/RankMath/AIOSEO or ACF),
    // map them here. Fallback to title/excerpt.
    const title = this.pickSeoTitle(post);
    const description = this.pickSeoDescription(post);
    const image = this.featuredImage(post) ?? this.absoluteUrl('/assets/images/heroAnimation.jpg');

    this.seo.setTitle(title);
    this.seo.setDescription(description);
    this.seo.setCanonical(url);
    this.seo.setOpenGraph({
      url,
      title,
      description,
      image,
      type: 'article',
    });

    // BlogPosting schema
    this.seo.setJsonLd('ld-blogposting', this.buildBlogPostingJsonLd(post, url, title, description, image));

    // Breadcrumb schema
    this.seo.setJsonLd('ld-breadcrumb', this.buildBreadcrumbJsonLd(post, url));
  }

  private pickSeoTitle(post: any): string {
    // Try plugin fields first (examples). Adjust to your WP payload.
    const pluginTitle =
      post?.yoast_head_json?.title ||
      post?.rank_math_seo?.title ||
      post?.aioseo?.title;

    const fallback = `${this.titleText(post)} | ${this.SITE_NAME}`;
    return (pluginTitle ? this.stripHtml(pluginTitle) : fallback).trim();
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
    if (!trimmed) return `Read the latest from ${this.SITE_NAME}.`;

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
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: this.SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: this.absoluteUrl('/blog') },
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

  stripHtml(html: string): string {
    return (html ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  titleText(post: any): string {
    return this.stripHtml(post?.title?.rendered ?? '');
  }

  dateLabel(post: any): string {
    const d = new Date(post?.date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' });
  }

  contentHtml(post: any): string {
    return post?.content?.rendered ?? '';
  }
}
