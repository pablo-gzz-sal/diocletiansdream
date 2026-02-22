import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { WpService } from '../../../shared/services/wp-service';
import { Header } from '../../../core/components/header/header';
import { Footer } from '../../../core/components/footer/footer';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer],
  selector: 'app-blog-post-page',
  templateUrl: './blog-post-page.html',
})
export class BlogPostPage implements OnInit, OnDestroy {
  loading = true;
  post: any | null = null;

  private sub?: Subscription;

  constructor(private route: ActivatedRoute, private wp: WpService) {}

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
  }

  fetch(slug: string): void {
    this.loading = true;
    this.post = null;

    this.wp.getPostBySlug(slug).subscribe({
      next: (res) => {
        this.post = (res && res.length) ? res[0] : null;
        this.loading = false;
      },
      error: () => {
        this.post = null;
        this.loading = false;
      },
    });
  }

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

  // Basic sanitization note:
  // WP content is HTML. Ideally sanitize server-side or use a sanitizer library.
  // Angular will sanitize some dangerous HTML by default, but keep plugins under control.
  contentHtml(post: any): string {
    return post?.content?.rendered ?? '';
  }
}