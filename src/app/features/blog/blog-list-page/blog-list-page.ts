import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WpService } from '../../../shared/services/wp-service';
import { Footer } from '../../../core/components/footer/footer';
import { Header } from '../../../core/components/header/header';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../shared/services/seo-service';
import { CtaBlock } from '../../../shared/components/cta-block/cta-block';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';
import { htmlToText } from '../../../shared/utils/html-text';

type CategoryTab = { id: number | null; slug: string; labelKey?: string; fallback: string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer, TranslateModule, CtaBlock, RevealOnScrollDirective],
  selector: 'app-blog-list-page',
  templateUrl: './blog-list-page.html',
})
export class BlogListPage implements OnInit {
  loading = true;
  private readonly SITE_URL = 'https://diocletiansdream.com';

  /** 'en' at /blog/, 'hr' at /hr/blog/. */
  private lang: 'en' | 'hr' = 'en';

  posts: any[] = [];
  categories: any[] = [];

  query = '';
  selectedCategoryId: number | null = null;

  // Client-side pagination over the fully-fetched, filtered set. The list itself
  // is not indexed page-by-page — individual posts are prerendered and sitemapped
  // — so paging is a browser-only navigation aid over the loaded posts.
  readonly pageSize = 9;
  currentPage = 1;

  categoryTabs: CategoryTab[] = [];

  private readonly CATEGORY_SLUG_TO_I18N: Record<string, string> = {
    'roman-history': 'blogPage.filters.romanHistory',
    'split-travel-guides': 'blogPage.filters.splitGuides',
    'things-to-do-in-split': 'blogPage.filters.thingsToDo',
    'family-group-travel': 'blogPage.filters.familyTravel',
    'beyond-split-day-trips': 'blogPage.filters.dayTrips',
  };

  constructor(
    private wp: WpService,
    private seo: SeoService,
    private route: ActivatedRoute,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.lang = this.route.snapshot.data['lang'] === 'hr' ? 'hr' : 'en';
    this.applySeo();
    this.loadPosts();

    // Category tabs resolve English category slugs to numeric ids. Croatian
    // posts reference the hr translations of those terms (different ids), so
    // the tabs only filter reliably on the English list — omit them on hr for
    // now (translated-category filtering is a follow-up).
    if (this.lang === 'en') {
      this.wp.getCategories().subscribe({
        next: (cats) => {
          this.categories = cats ?? [];
          this.buildCategoryTabs();
        },
        error: () => {
          this.categories = [];
          this.buildCategoryTabs();
        },
      });
    }
  }

  private buildCategoryTabs(): void {
    const wantedSlugs = Object.keys(this.CATEGORY_SLUG_TO_I18N);

    this.categoryTabs = wantedSlugs.map((slug) => {
      const cat = this.categories.find((c) => c?.slug === slug);
      return {
        id: cat?.id ?? null,
        slug,
        labelKey: this.CATEGORY_SLUG_TO_I18N[slug],
        fallback: cat?.name ?? slug.replace(/-/g, ' '),
      };
    });
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = id;
    this.currentPage = 1;
    // Optional: clear search when switching categories
    // this.query = '';
  }

  /** Reset to the first page whenever the search query changes. */
  onQueryChange(): void {
    this.currentPage = 1;
  }

  /** Lang-aware post link: /slug on English, /hr/slug under the Croatian tree. */
  postLink(post: any): any[] {
    return this.lang === 'hr' ? ['/hr', post?.slug] : ['/', post?.slug];
  }

  /** The filtered posts for the current page only. */
  pagedPosts(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPosts().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPosts().length / this.pageSize));
  }

  pageList(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  goToPage(n: number): void {
    this.currentPage = Math.min(Math.max(1, n), this.totalPages());
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadPosts(): void {
    this.loading = true;
    // Fetch the whole set (per_page max is 100; well above the post count per
    // language) so search, category filtering and pagination all operate over
    // every post rather than an arbitrary first slice. `lang` is ALWAYS sent:
    // once Polylang's REST filter is active, omitting it returns every language
    // mixed together, so the English list must ask for `en` explicitly.
    this.wp.getPosts(1, 100, this.lang).subscribe({
      next: (posts) => {
        this.posts = posts ?? [];
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.posts = [];
        this.loading = false;
        
      },
    });
  }

  featuredImage(post: any): string | null {
    return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
  }

  categoryLabel(post: any): string | null {
    const ids: number[] = post?.categories ?? [];
    if (!ids.length) return null;
    const cat = this.categories.find((c) => c.id === ids[0]);
    return cat?.name ?? null;
  }

  /** Decodes entities as well as stripping tags — see htmlToText. */
  stripHtml(html: string): string {
    return htmlToText(html);
  }

  excerptText(post: any): string {
    return this.stripHtml(post?.excerpt?.rendered ?? '');
  }

  titleText(post: any): string {
    return this.stripHtml(post?.title?.rendered ?? '');
  }

  /** Croatian on the hr list; the visitor's own locale on the English one. */
  dateLabel(post: any): string {
    const d = new Date(post?.date);
    if (isNaN(d.getTime())) return '';
    const locale = this.lang === 'hr' ? 'hr-HR' : undefined;
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: '2-digit' });
  }

  /**
   * Every post, ignoring the search box and category tabs. The archive list at
   * the foot of the page renders from this rather than from `filteredPosts()`
   * so the full set stays linked no matter what filter the reader has applied.
   */
  allPosts(): any[] {
    return this.posts;
  }

  filteredPosts(): any[] {
    let list = [...this.posts];

    if (this.selectedCategoryId) {
      list = list.filter((p) => (p?.categories ?? []).includes(this.selectedCategoryId as number));
    }

    const q = this.query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const t = this.titleText(p).toLowerCase();
        const e = this.excerptText(p).toLowerCase();
        return t.includes(q) || e.includes(q);
      });
    }

    return list;
  }

  trackById(_: number, p: any) {
    return p?.id;
  }

  private applySeo(): void {
  // Locale-correct meta (the language JSON is already loaded by languageResolver
  // before this component activates, so instant() resolves synchronously).
  const title = this.translate.instant('blogPage.seo.metaTitle');
  const description = this.translate.instant('blogPage.seo.metaDescription');

  const enUrl = `${this.SITE_URL}/blog/`;
  const hrUrl = `${this.SITE_URL}/hr/blog/`;
  const url = this.lang === 'hr' ? hrUrl : enUrl;

  this.seo.setTitle(title);
  this.seo.setDescription(description);
  this.seo.setRobots();
  this.seo.setCanonical(url);
  // Reciprocal hreflang: /blog/ <-> /hr/blog/. Both locales emit the same three
  // tags (Google ignores one-way annotations).
  this.seo.setAlternates([
    { hreflang: 'en', href: enUrl },
    { hreflang: 'hr', href: hrUrl },
    { hreflang: 'x-default', href: enUrl },
  ]);

  this.seo.setOpenGraph({
    url,
    title,
    description,
    image: `${this.SITE_URL}/assets/images/vr/peristyle-crowd.jpg`,
    type: 'website',
    locale: this.lang === 'hr' ? 'hr_HR' : 'en_US',
  });

  // Typed Blog rather than a bare CollectionPage, and wired to the shared
  // WebSite / Organization @ids the marketing pages declare, so the blog reads
  // as part of one brand instead of a detached list page. The breadcrumb
  // matches the one each post emits, which is what makes Home > Blog > Post
  // resolve as a chain in Search.
  this.seo.setJsonLd('ld-blog-collection', {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollectionPage', 'Blog'],
        '@id': `${url}#webpage`,
        name: title,
        description,
        url,
        inLanguage: this.lang === 'hr' ? 'hr-HR' : 'en-US',
        isPartOf: { '@id': `${this.SITE_URL}/#website` },
        publisher: { '@id': `${this.SITE_URL}/#organization` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: this.translate.instant('header.nav.home'),
            item: this.lang === 'hr' ? `${this.SITE_URL}/hr/` : `${this.SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: this.translate.instant('header.nav.blog'),
            item: url,
          },
        ],
      },
    ],
  });
}
}
