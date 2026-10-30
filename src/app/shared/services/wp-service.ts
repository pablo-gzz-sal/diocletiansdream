import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of, retry, switchMap, tap, timer } from 'rxjs';
import { AltById, attachmentIdsIn, WpContentService } from './wp-content';

/**
 * Retry a WordPress request a few times with backoff.
 *
 * The stakes are asymmetric: BlogPostPage turns any fetch error into
 * "Post not found" + noindex, so a single blip while prerendering silently
 * deindexes that post — the build still reports success. One flaky request out
 * of 29 is exactly what took a post out on a CI build, and the CMS sits behind
 * a WAF that can reject a burst from an unfamiliar IP.
 *
 * Cheap insurance: at build time these run once per page, not per visitor.
 */
function retryTransient<T>() {
  return retry<T>({ count: 3, delay: (_err, attempt) => timer(300 * 2 ** (attempt - 1)) });
}

@Injectable({ providedIn: 'root' })
export class WpService {
  private api = `${environment.wpBaseUrl}/wp-json/wp/v2`;

  // WordPress content and media URLs are still stored against the old root
  // domain (e.g. https://diocletiansdream.com/wp-content/...). The root domain
  // is the static Angular site now and has no /wp-content, so those assets 404.
  // Rewrite the host to the CMS (wpBaseUrl), which actually serves the media.
  private readonly oldMediaHost = new URL(environment.siteUrl).host; // diocletiansdream.com
  private readonly newMediaHost = new URL(environment.wpBaseUrl).host; // cms.diocletiansdream.com
  private readonly postListFields =
    'id,slug,date,modified,title,excerpt,link,categories,jetpack_featured_media_url';
  private readonly relatedFields = 'id,slug,title,tags,jetpack_featured_media_url';

  private readonly content = inject(WpContentService);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

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
      .join(`https://${this.newMediaHost}/`)
      // These two legacy partner links have confirmed HTTPS destinations. Keep
      // this intentionally exact: other outbound URLs are content decisions,
      // not an automatic scheme-migration surface.
      .split('http://www.adriatic.hr')
      .join('https://www.adriatic.hr')
      .split('http://www.oh-split.com')
      .join('https://www.oh-split.com');
    return JSON.parse(json) as T;
  }

  getPosts(page = 1, perPage = 12, lang?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage)
      // `getPosts` feeds the blog index cards only. Requesting all post
      // bodies here made Angular serialize the whole archive into every blog
      // page's server-state script. Jetpack's media URL keeps card imagery
      // without the large WordPress embed payload.
      .set('_fields', this.postListFields);
    // Polylang language filter (see the mu-plugin `dd-polylang-rest`). Omitted
    // for English callers, which keeps the default-language behaviour.
    if (lang) params = params.set('lang', lang);

    return this.http
      .get<any[]>(`${this.api}/posts`, { params })
      .pipe(
        // A blip here prerenders an empty blog index — which the build canary
        // cannot flag, since an empty list page is still validly indexable.
        retryTransient(),
        map((posts) => this.normalizeMedia(posts)),
      );
  }

  /**
   * Candidates for a post's related cards. Never transferred with the page: the
   * prerendered source of an article must not carry the other articles. The
   * page stores just the 4 cards it picks (see BlogPostPage.loadRelated).
   */
  getRelatedCandidates(lang?: string) {
    let params = new HttpParams().set('per_page', 100).set('_fields', this.relatedFields);
    if (lang) params = params.set('lang', lang);

    return this.http.get<any[]>(`${this.api}/posts`, { params, transferCache: false }).pipe(
      retryTransient(),
      map((posts) => this.normalizeMedia(posts)),
    );
  }

  /**
   * The only place `content.rendered` is cleaned, because it is the only place
   * a full body is rendered — the list pages show excerpts, so cleaning their
   * dozen unread bodies would be pure waste.
   */
  getPostBySlug(slug: string, lang?: string) {
    const key = makeStateKey<any>(`post:${lang ?? 'en'}:${slug}`);
    if (this.transferState.hasKey(key)) {
      const post = this.transferState.get(key, null);
      this.transferState.remove(key);
      return of([post]);
    }

    let params = new HttpParams().set('slug', slug).set('_embed', 'true');
    if (lang) params = params.set('lang', lang);
    return this.http.get<any[]>(`${this.api}/posts`, { params, transferCache: false }).pipe(
      retryTransient(),
      map((posts) => this.normalizeMedia(posts)),
      switchMap((posts) => this.withCleanContent(posts)),
      tap((posts) => {
        if (isPlatformServer(this.platformId) && posts?.length) {
          this.transferState.set(key, this.forTransfer(posts[0]));
        }
      }),
    );
  }

  /**
   * Only what the post page reads on its first browser render. The raw response
   * also holds Yoast's full head, REST links and embedded media records, which
   * would otherwise ship in the page source of every article.
   */
  private forTransfer(post: any): any {
    const yoast = post?.yoast_head_json;
    const author = post?._embedded?.author?.[0];
    const media = post?._embedded?.['wp:featuredmedia']?.[0];
    return {
      id: post?.id,
      slug: post?.slug,
      date: post?.date,
      modified: post?.modified,
      title: post?.title,
      content: post?.content,
      excerpt: post?.excerpt,
      tags: post?.tags,
      lang: post?.lang,
      translations: post?.translations,
      jetpack_featured_media_url: post?.jetpack_featured_media_url,
      yoast_head_json: yoast && { title: yoast.title, description: yoast.description, og_title: yoast.og_title },
      _embedded: {
        author: author ? [{ name: author.name, url: author.url }] : [],
        'wp:featuredmedia': media ? [{ source_url: media.source_url }] : [],
      },
    };
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

    return this.http.get<any[]>(`${this.api}/media`, { params, transferCache: false }).pipe(
      map((media) => new Map(media.map((m) => [m.id as number, (m.alt_text as string) ?? '']))),
      catchError(() => of(empty)),
    );
  }

  getCategories() {
    return this.http.get<any[]>(`${this.api}/categories?per_page=100&_fields=id,slug,name`);
  }

  getSamplePosts(lang?: string): Observable<any[]> {
  // `lang` must be passed by callers: with Polylang's REST filter active,
  // omitting it returns every language mixed together.
  const langParam = lang ? `&lang=${lang}` : '';
  return this.http
    .get<any[]>(`${this.api}/posts?per_page=20&_embed=true${langParam}`)
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
  return post?.jetpack_featured_media_url ?? post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
}
