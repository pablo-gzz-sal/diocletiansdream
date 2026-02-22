import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WpService } from '../../../shared/services/wp-service';
import { Footer } from '../../../core/components/footer/footer';
import { Header } from '../../../core/components/header/header';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  selector: 'app-blog-list-page',
  templateUrl: './blog-list-page.html',
})
export class BlogListPage implements OnInit {
  loading = true;

  posts: any[] = [];
  categories: any[] = [];

  query = '';
  selectedCategoryId: number | null = null;

  constructor(private wp: WpService) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.loadPosts();
    this.wp.getCategories().subscribe({
      next: (cats) => (this.categories = cats ?? []),
      error: () => (this.categories = []),
    });
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
    const cat = this.categories.find(c => c.id === ids[0]);
    return cat?.name ?? null;
  }

  stripHtml(html: string): string {
    return (html ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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
      list = list.filter(p => (p?.categories ?? []).includes(this.selectedCategoryId as number));
    }

    const q = this.query.trim().toLowerCase();
    if (q) {
      list = list.filter(p => {
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
}