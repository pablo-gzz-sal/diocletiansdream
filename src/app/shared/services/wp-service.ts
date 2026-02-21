import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

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
}

export function getFeaturedImage(post: any): string | null {
  return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
}