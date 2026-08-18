import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { BlogPostPage } from './blog-post-page';
import { SeoService } from '../../../shared/services/seo-service';
import { WpService } from '../../../shared/services/wp-service';
import { PostLanguageRouteService } from '../../../core/i18n/post-language-route.service';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

/**
 * A Croatian post whose Yoast SEO-title field was left in English — the exact
 * payload that shipped an English <title> on /hr/vr-iskustvo-dioklecijanova-palaca/.
 */
const HR_POST_WITH_ENGLISH_YOAST_TITLE = {
  slug: 'vr-iskustvo-dioklecijanova-palaca',
  title: {
    rendered:
      'Zašto je VR iskustvo jedan od najboljih načina da upoznate Dioklecijanovu palaču',
  },
  yoast_head_json: {
    title: 'VR Experience in Split: Discover Diocletian’s Palace',
    og_title:
      'Zašto je VR iskustvo jedan od najboljih načina da upoznate Dioklecijanovu palaču',
  },
};

type PostLoadObserver = {
  next: (posts: any[]) => void;
  error: (error: unknown) => void;
};

/**
 * Deliberately keeps delivering to the original observer after unsubscribe.
 * This models a non-cooperative producer so the component's own stale-request
 * guard is tested rather than RxJS's closed-subscriber behaviour.
 */
function nonCooperativePostLoad() {
  let observer: PostLoadObserver | undefined;
  let unsubscribeCalls = 0;

  return {
    source: {
      subscribe(destination: PostLoadObserver) {
        observer = destination;
        return { unsubscribe: () => unsubscribeCalls++ };
      },
    } as unknown as Observable<any[]>,
    next(posts: any[]) {
      observer?.next(posts);
    },
    error(error: unknown) {
      observer?.error(error);
    },
    get unsubscribeCalls() {
      return unsubscribeCalls;
    },
  };
}

describe('BlogPostPage', () => {
  let component: BlogPostPage;
  let fixture: ComponentFixture<BlogPostPage>;
  const routeParams = new BehaviorSubject(convertToParamMap({}));
  const routeSnapshot = { data: { lang: 'en' } };
  const routeStub = {
    paramMap: routeParams.asObservable(),
    snapshot: routeSnapshot,
  };

  /** The title is picked by a private helper; drive it directly. */
  const pickTitle = (lang: 'en' | 'hr', post: unknown) => {
    (component as any).lang = lang;
    return (component as any).pickSeoTitle(post) as string;
  };

  beforeEach(async () => {
    routeParams.next(convertToParamMap({}));
    routeSnapshot.data.lang = 'en';

    await TestBed.configureTestingModule({
      imports: [BlogPostPage, ...commonTestImports],
      providers: [
        ...commonTestProviders,
        { provide: ActivatedRoute, useValue: routeStub },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens an in-page lightbox when a featured image is clicked', () => {
    component.loading = false;
    component.post = {
      date: '2026-08-11T00:00:00.000Z',
      title: { rendered: 'Gallery post' },
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'https://example.com/featured.jpg' }],
      },
      content: {
        rendered: '<figure class="wp-block-gallery"><figure class="wp-block-image"><img src="https://example.com/gallery.jpg" alt="Gallery visitor" /></figure></figure>',
      },
    };
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.post-image-image') as HTMLImageElement;
    image.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const lightbox = fixture.nativeElement.querySelector('.blog-gallery-lightbox') as HTMLElement | null;
    expect(lightbox).not.toBeNull();
    expect(lightbox?.querySelector('img')?.getAttribute('src')).toBe('https://example.com/featured.jpg');
  });

  it('opens an in-page lightbox for an editorial post image without changing its link', () => {
    component.loading = false;
    component.post = {
      date: '2026-08-11T00:00:00.000Z',
      title: { rendered: 'Gallery post' },
      content: {
        rendered: '<p><img src="https://example.com/gallery.jpg" alt="Gallery visitor" /></p>',
      },
    };
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.blog-prose img') as HTMLImageElement;
    image.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const lightbox = fixture.nativeElement.querySelector('.blog-gallery-lightbox') as HTMLElement | null;

    expect(lightbox?.querySelector('img')?.getAttribute('src')).toBe('https://example.com/gallery.jpg');
  });

  it('moves to the next image in the post from the lightbox', () => {
    component.loading = false;
    component.post = {
      date: '2026-08-11T00:00:00.000Z',
      title: { rendered: 'Gallery post' },
      content: {
        rendered: '<p><img src="https://example.com/first.jpg" alt="First image" /></p><p><img src="https://example.com/second.jpg" alt="Second image" /></p>',
      },
    };
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.blog-prose img') as HTMLImageElement;
    image.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const next = fixture.nativeElement.querySelector('.blog-gallery-lightbox__next') as HTMLButtonElement;
    expect(next).not.toBeNull();
    next.click();
    fixture.detectChanges();

    const preview = fixture.nativeElement.querySelector('.blog-gallery-lightbox__image') as HTMLImageElement;
    expect(preview.getAttribute('src')).toBe('https://example.com/second.jpg');
  });

  it('takes the Croatian title from og_title when the Yoast SEO title is English', () => {
    expect(pickTitle('hr', HR_POST_WITH_ENGLISH_YOAST_TITLE)).toBe(
      "Zašto je VR iskustvo jedan od najboljih načina da upoznate Dioklecijanovu palaču | Diocletian's Dream"
    );
  });

  it('keeps the authored Yoast SEO title on English posts, even when it is a rewrite', () => {
    const post = {
      title: { rendered: 'One day in Split: itinerary from Diocletian&#039;s Palace' },
      yoast_head_json: {
        title: 'Split Itinerary: Perfect for Any Weather Conditions',
        og_title: 'One day in Split: itinerary from Diocletian’s Palace',
      },
    };

    expect(pickTitle('en', post)).toBe('Split Itinerary: Perfect for Any Weather Conditions');
  });

  it('keeps a Croatian SEO title that was authored on top of the post title', () => {
    const post = {
      title: { rendered: 'Tko je bio Dioklecijan?' },
      yoast_head_json: {
        title: 'Tko je bio Dioklecijan? Car koji je promijenio Rimsko Carstvo',
        og_title: 'Tko je bio Dioklecijan?',
      },
    };

    expect(pickTitle('hr', post)).toBe(
      'Tko je bio Dioklecijan? Car koji je promijenio Rimsko Carstvo'
    );
  });

  it('does not double-brand a title that already carries the site name', () => {
    const post = {
      title: { rendered: 'Kako je nastao Diocletian’s Dream' },
      yoast_head_json: {
        title: 'How Diocletian’s Dream came to be',
        og_title: 'Kako je nastao Diocletian’s Dream',
      },
    };

    expect(pickTitle('hr', post)).toBe('Kako je nastao Diocletian’s Dream');
  });

  it('falls back to the post title when the post carries no SEO plugin fields', () => {
    expect(pickTitle('hr', { title: { rendered: 'Tko je bio Dioklecijan?' } })).toBe(
      "Tko je bio Dioklecijan? | Diocletian's Dream"
    );
  });

  it('spells the post date in Croatian on hr pages', () => {
    (component as any).lang = 'hr';

    expect(component.dateLabel({ date: '2026-07-25T10:00:00' })).toContain('srpnja');
  });

  /**
   * `:slug` (and `hr/:slug`) is a single-segment wildcard, so every unknown
   * one-segment URL lands here rather than on NotFound — /hr/experience/ among
   * them (see app.routes.spec.ts). That is only acceptable because the
   * unknown-slug state is a real 404: noindex plus the status marker the SSR
   * server promotes to an HTTP 404.
   */
  it('serves an unknown slug as a real 404, not a soft one', () => {
    const seo = TestBed.inject(SeoService);
    const robots = spyOn(seo, 'setRobots');
    const status = spyOn(seo, 'setHttpStatus');
    spyOn(TestBed.inject(WpService), 'getPostBySlug').and.returnValue(of([]));

    component.fetch('experience');

    expect(component.post).toBeNull();
    expect(robots).toHaveBeenCalledWith(true);
    expect(status).toHaveBeenCalledWith(404);
  });

  it('registers the current URL and translation slugs after loading a post', () => {
    const router = TestBed.inject(Router);
    const routes = TestBed.inject(PostLanguageRouteService);
    const post = {
      slug: 'diocletians-palace-vr-experience',
      translations: {
        en: 'diocletians-palace-vr-experience',
        hr: 'vr-iskustvo-dioklecijanova-palaca',
      },
    };
    spyOnProperty(router, 'url', 'get').and.returnValue('/diocletians-palace-vr-experience');
    spyOn(TestBed.inject(WpService), 'getPostBySlug').and.returnValue(of([post]));
    const register = spyOn(routes, 'register').and.callThrough();

    component.fetch('diocletians-palace-vr-experience');

    expect(register).toHaveBeenCalledWith('/diocletians-palace-vr-experience', post.translations);
    expect(routes.destinationFor('/diocletians-palace-vr-experience', 'hr')).toBe(
      '/hr/vr-iskustvo-dioklecijanova-palaca',
    );
  });

  it('loads the Croatian translation in Croatian when the reused page changes locale', () => {
    const router = TestBed.inject(Router);
    let currentUrl = '/english-post';
    spyOnProperty(router, 'url', 'get').and.callFake(() => currentUrl);
    const postLoads = spyOn(TestBed.inject(WpService), 'getPostBySlug').and.returnValues(
      of([{ slug: 'english-post', translations: { en: 'english-post', hr: 'hrvatski-post' } }]),
      of([{ slug: 'hrvatski-post', translations: { en: 'english-post', hr: 'hrvatski-post' } }]),
    );

    routeParams.next(convertToParamMap({ slug: 'english-post' }));
    currentUrl = '/hr/hrvatski-post';
    routeSnapshot.data.lang = 'hr';
    routeParams.next(convertToParamMap({ slug: 'hrvatski-post' }));

    expect(postLoads.calls.argsFor(1)).toEqual(['hrvatski-post', 'hr']);
    expect(component.post?.slug).toBe('hrvatski-post');
  });

  it('clears the registered post route when destroyed', () => {
    const router = TestBed.inject(Router);
    const routes = TestBed.inject(PostLanguageRouteService);
    spyOnProperty(router, 'url', 'get').and.returnValue('/diocletians-palace-vr-experience');
    spyOn(TestBed.inject(WpService), 'getPostBySlug').and.returnValue(of([{
      slug: 'diocletians-palace-vr-experience',
      translations: {
        en: 'diocletians-palace-vr-experience',
        hr: 'vr-iskustvo-dioklecijanova-palaca',
      },
    }]));

    component.fetch('diocletians-palace-vr-experience');
    fixture.destroy();

    expect(routes.destinationFor('/diocletians-palace-vr-experience', 'hr')).toBeNull();
  });

  it('ignores a response when its requested route is no longer current', () => {
    const router = TestBed.inject(Router);
    const routes = TestBed.inject(PostLanguageRouteService);
    const seo = TestBed.inject(SeoService);
    let emit!: (value: any[]) => void;
    let fail!: (error: unknown) => void;
    const pending = new Observable<any[]>((subscriber) => {
      emit = (value) => subscriber.next(value);
      fail = (error) => subscriber.error(error);
      return undefined;
    });
    let currentUrl = '/first-post';
    spyOnProperty(router, 'url', 'get').and.callFake(() => currentUrl);
    spyOn(TestBed.inject(WpService), 'getPostBySlug').and.returnValue(pending);
    const register = spyOn(routes, 'register').and.callThrough();
    const setTitle = spyOn(seo, 'setTitle');
    const setRobots = spyOn(seo, 'setRobots');

    component.fetch('first-post');
    currentUrl = '/second-post';
    routes.register('/second-post', { en: 'second-post', hr: 'drugi-post' });
    emit([{ slug: 'first-post', translations: { en: 'first-post', hr: 'prvi-post' } }]);
    fail(new Error('late request failure'));

    expect(component.post).toBeNull();
    expect(register).toHaveBeenCalledTimes(1);
    expect(routes.destinationFor('/second-post', 'hr')).toBe('/hr/drugi-post');
    expect(setTitle).not.toHaveBeenCalled();
    expect(setRobots).not.toHaveBeenCalled();
  });

  it('cancels an older request and keeps the newer post route', () => {
    const router = TestBed.inject(Router);
    const routes = TestBed.inject(PostLanguageRouteService);
    const seo = TestBed.inject(SeoService);
    const first = nonCooperativePostLoad();
    let currentUrl = '/first-post';
    spyOnProperty(router, 'url', 'get').and.callFake(() => currentUrl);
    const postLoads = spyOn(TestBed.inject(WpService), 'getPostBySlug').and.returnValues(
      first.source,
      of([{
        slug: 'second-post',
        translations: { en: 'second-post', hr: 'drugi-post' },
      }]),
    );
    const setTitle = spyOn(seo, 'setTitle');
    const setRobots = spyOn(seo, 'setRobots');

    component.fetch('first-post');
    currentUrl = '/second-post';
    component.fetch('second-post');
    expect(postLoads).toHaveBeenCalledTimes(2);
    expect(first.unsubscribeCalls).toBe(1);
    const titleCallsAfterB = setTitle.calls.count();
    const robotsCallsAfterB = setRobots.calls.count();
    first.next([{
      slug: 'first-post',
      translations: { en: 'first-post', hr: 'prvi-post' },
    }]);
    first.error(new Error('late request failure'));

    expect(component.post?.slug).toBe('second-post');
    expect(routes.destinationFor('/second-post', 'hr')).toBe('/hr/drugi-post');
    expect(setTitle.calls.count()).toBe(titleCallsAfterB);
    expect(setRobots.calls.count()).toBe(robotsCallsAfterB);
  });

  it('cancels a pending request on destroy and ignores later producer activity', () => {
    const router = TestBed.inject(Router);
    const routes = TestBed.inject(PostLanguageRouteService);
    const seo = TestBed.inject(SeoService);
    const pending = nonCooperativePostLoad();
    spyOnProperty(router, 'url', 'get').and.returnValue('/pending-post');
    spyOn(TestBed.inject(WpService), 'getPostBySlug').and.returnValue(pending.source);
    const setTitle = spyOn(seo, 'setTitle');
    const setRobots = spyOn(seo, 'setRobots');

    component.fetch('pending-post');
    fixture.destroy();
    pending.next([{ slug: 'pending-post', translations: { en: 'pending-post', hr: 'post-na-cekanju' } }]);
    pending.error(new Error('destroyed request failure'));

    expect(pending.unsubscribeCalls).toBe(1);
    expect(component.post).toBeNull();
    expect(routes.destinationFor('/pending-post', 'hr')).toBeNull();
    expect(setTitle).not.toHaveBeenCalled();
    expect(setRobots).not.toHaveBeenCalled();
  });
});
