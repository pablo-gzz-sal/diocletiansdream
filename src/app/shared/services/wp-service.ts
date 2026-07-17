import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AltById, attachmentIdsIn, WpContentService } from './wp-content';

@Injectable({ providedIn: 'root' })
export class WpService {
  private api = `${environment.wpBaseUrl}/wp-json/wp/v2`;

  // WordPress content and media URLs are still stored against the old root
  // domain (e.g. https://diocletiansdream.com/wp-content/...). The root domain
  // is the static Angular site now and has no /wp-content, so those assets 404.
  // Rewrite the host to the CMS (wpBaseUrl), which actually serves the media.
  private readonly oldMediaHost = new URL(environment.siteUrl).host; // diocletiansdream.com
  private readonly newMediaHost = new URL(environment.wpBaseUrl).host; // cms.diocletiansdream.com

  private readonly content = inject(WpContentService);

  constructor(private http: HttpClient) {}

  /**
   * Deep-rewrite old-domain /wp-content asset URLs to the CMS host. Handles both
   * direct references (`//diocletiansdream.com/wp-content/...`) and the Jetpack
   * Photon CDN form where the origin host is a path segment
   * (`//i1.wp.com/diocletiansdream.com/wp-content/...`).
   *
   * The host rewrites are deliberately scheme-agnostic (`//host/...`), which
   * means an `http://` source survives as `http://cms...` and the browser flags
   * it as mixed content. Upgrading afterwards catches every one of them, and is
   * scoped to the CMS host so outbound links keep whatever scheme they had.
   */
  private normalizeMedia<T>(data: T): T {
    // No early return when the hosts match: the host swaps become no-ops, but
    // the scheme upgrade below still has to run.
    const json = JSON.stringify(data)
      .split(`//${this.oldMediaHost}/wp-content`)
      .join(`//${this.newMediaHost}/wp-content`)
      .split(`.wp.com/${this.oldMediaHost}/wp-content`)
      .join(`.wp.com/${this.newMediaHost}/wp-content`)
      .split(`http://${this.newMediaHost}/`)
      .join(`https://${this.newMediaHost}/`);
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

  /**
   * The only place `content.rendered` is cleaned, because it is the only place
   * a full body is rendered — the list pages show excerpts, so cleaning their
   * dozen unread bodies would be pure waste.
   */
  getPostBySlug(slug: string) {
    const params = new HttpParams().set('slug', slug).set('_embed', 'true');
    return this.http.get<any[]>(`${this.api}/posts`, { params }).pipe(
      map((posts) => this.normalizeMedia(posts)),
      switchMap((posts) => this.withCleanContent(posts)),
    );
  }

  private withCleanContent(posts: any[]): Observable<any[]> {
    if (!posts?.length) return of(posts);

    const ids = posts.flatMap((post) => attachmentIdsIn(post?.content?.rendered ?? ''));

    return this.getAltByAttachmentId(ids).pipe(
      map((altById) =>
        posts.map((post) =>
          post?.content?.rendered
            ? {
                ...post,
                content: { ...post.content, rendered: this.content.clean(post.content.rendered, altById) },
              }
            : post,
        ),
      ),
    );
  }

  /**
   * Alt text lives in the media library, but the editor baked `alt=""` into the
   * post HTML at insert time, so it has to be looked up and reapplied.
   *
   * Never allowed to fail the caller: a media-endpoint hiccup at prerender time
   * would otherwise take out the whole article rather than just its alt text.
   */
  private getAltByAttachmentId(ids: number[]): Observable<AltById> {
    const empty: AltById = new Map();
    if (!ids.length) return of(empty);

    const params = new HttpParams()
      .set('include', ids.join(','))
      .set('per_page', Math.min(ids.length, 100))
      .set('_fields', 'id,alt_text');

    return this.http.get<any[]>(`${this.api}/media`, { params }).pipe(
      map((media) => new Map(media.map((m) => [m.id as number, (m.alt_text as string) ?? '']))),
      catchError(() => of(empty)),
    );
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