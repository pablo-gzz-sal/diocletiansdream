import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WpService } from '../../../shared/services/wp-service';
import { Footer } from '../../../core/components/footer/footer';
import { Header } from '../../../core/components/header/header';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../shared/services/seo-service';
import { CtaBlock } from '../../../shared/components/cta-block/cta-block';

type CategoryTab = { id: number | null; slug: string; labelKey?: string; fallback: string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer, TranslateModule, CtaBlock],
  selector: 'app-blog-list-page',
  templateUrl: './blog-list-page.html',
})
export class BlogListPage implements OnInit {
  loading = true;
  private readonly SITE_URL = 'https://diocletiansdream.com';

  posts: any[] = [];
  categories: any[] = [];

  query = '';
  selectedCategoryId: number | null = null;

  categoryTabs: CategoryTab[] = [];

  private readonly CATEGORY_SLUG_TO_I18N: Record<string, string> = {
    'roman-history': 'blogPage.filters.romanHistory',
    'split-travel-guides': 'blogPage.filters.splitGuides',
    'things-to-do-in-split': 'blogPage.filters.thingsToDo',
    'family-group-travel': 'blogPage.filters.familyTravel',
    'beyond-split-day-trips': 'blogPage.filters.dayTrips',
  };

  constructor(private wp: WpService, private seo: SeoService) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.loadPosts();

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
    // Optional: clear search when switching categories
    // this.query = '';
  }

  loadPosts(): void {
    this.loading = true;
    this.wp.getPosts(1, 30).subscribe({
      next: (posts) => {
        this.posts = posts ?? [];
        this.loading = false;
      },
      error: () => {
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

  stripHtml(html: string): string {
    return (html ?? '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  excerptText(post: any): string {
    return this.stripHtml(post?.excerpt?.rendered ?? '');
  }

  titleText(post: any): string {
    return this.stripHtml(post?.title?.rendered ?? '');
  }

  dateLabel(post: any): string {
    const d = new Date(post?.date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
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
  const title = 'Diocletian’s Dream Blog | Roman History & Things to Do in Split'
  const description = 'Read articles about Diocletian’s Palace, Roman history, and things to do in Split. Explore Split travel guides and cultural insights connected to the immersive VR experience.'

  const url = `${this.SITE_URL}/blog`;

  this.seo.setTitle(title);
  this.seo.setDescription(description);
  this.seo.setCanonical(url);

  this.seo.setOpenGraph({
    url,
    title,
    description,
    image: `${this.SITE_URL}/assets/images/heroAnimation.jpg`,
    type: 'website'
  });

  this.seo.setJsonLd('ld-blog-collection', {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    url: url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Diocletian’s Dream',
      url: this.SITE_URL
    }
  });
}
}
