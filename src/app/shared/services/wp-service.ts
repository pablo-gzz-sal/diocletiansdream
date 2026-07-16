import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WpService {
  private api = `${environment.wpBaseUrl}/wp-json/wp/v2`;

  // WordPress content and media URLs are still stored against the old root
  // domain (e.g. https://diocletiansdream.com/wp-content/...). The root domain
  // is the static Angular site now and has no /wp-content, so those assets 404.
  // Rewrite the host to the CMS (wpBaseUrl), which actually serves the media.
  private readonly oldMediaHost = new URL(environment.siteUrl).host; // diocletiansdream.com
  private readonly newMediaHost = new URL(environment.wpBaseUrl).host; // cms.diocletiansdream.com

  constructor(private http: HttpClient) {}

  /**
   * Deep-rewrite old-domain /wp-content asset URLs to the CMS host. Handles both
   * direct references (`//diocletiansdream.com/wp-content/...`) and the Jetpack
   * Photon CDN form where the origin host is a path segment
   * (`//i1.wp.com/diocletiansdream.com/wp-content/...`).
   */
  private normalizeMedia<T>(data: T): T {
    if (this.oldMediaHost === this.newMediaHost) return data;
    const json = JSON.stringify(data)
      .split(`//${this.oldMediaHost}/wp-content`)
      .join(`//${this.newMediaHost}/wp-content`)
      .split(`.wp.com/${this.oldMediaHost}/wp-content`)
      .join(`.wp.com/${this.newMediaHost}/wp-content`);
    return JSON.parse(json) as T;
  }

  getPosts(page = 1, perPage = 12) {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage)
      .set('_embed', 'true');

    return this.http
      .get<any[]>(`${this.api}/posts`, { params })
      .pipe(map((posts) => this.normalizeMedia(posts)));
  }

  getPostBySlug(slug: string) {
    const params = new HttpParams().set('slug', slug).set('_embed', 'true');
    return this.http
      .get<any[]>(`${this.api}/posts`, { params })
      .pipe(map((posts) => this.normalizeMedia(posts)));
  }

  getCategories() {
    return this.http.get<any[]>(`${this.api}/categories?per_page=100`);
  }

  getSamplePosts(): Observable<any[]> {
  return this.http
    .get<any[]>(`${this.api}/posts?per_page=20&_embed=true`)
    .pipe(
      map(posts => this.normalizeMedia(posts)),
      map(posts => {
        const mapped = posts.map(post => ({
          id: post.id,
          slug: post.slug,
          title: post.title.rendered,
          excerpt: post.excerpt.rendered,
          image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
        }));

        // Shuffle array
        return mapped.sort(() => 0.5 - Math.random()).slice(0, 3);
      })
    );
}
}

export function getFeaturedImage(post: any): string | null {
  return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
}