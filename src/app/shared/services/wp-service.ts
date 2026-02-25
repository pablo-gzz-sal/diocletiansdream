import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WpService {
  private api = `${environment.wpBaseUrl}/wp-json/wp/v2`;

  constructor(private http: HttpClient) {}

  getPosts(page = 1, perPage = 12) {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage)
      .set('_embed', 'true');

    return this.http.get<any[]>(`${this.api}/posts`, { params });
  }

  getPostBySlug(slug: string) {
    const params = new HttpParams().set('slug', slug).set('_embed', 'true');
    return this.http.get<any[]>(`${this.api}/posts`, { params });
  }

  getCategories() {
    return this.http.get<any[]>(`${this.api}/categories?per_page=100`);
  }

  getSamplePosts(): Observable<any[]> {
  return this.http
    .get<any[]>(`${this.api}/posts?per_page=20&_embed=true`)
    .pipe(
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