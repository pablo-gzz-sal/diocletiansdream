import { TestBed } from '@angular/core/testing';
import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { WpService } from './wp-service';

describe('WpService', () => {
  let service: WpService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WpService);
    http = TestBed.inject(HttpTestingController);
  });

  const isPosts = (req: HttpRequest<unknown>) => req.url.endsWith('/posts');
  const isMedia = (req: HttpRequest<unknown>) => req.url.endsWith('/media');

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('upgrades http:// CMS media to https so the browser stops flagging mixed content', () => {
    let got: any;
    service.getPostBySlug('x').subscribe((p) => (got = p));

    // WordPress stores content images against the old root domain, over http.
    http
      .expectOne(isPosts)
      .flush([{ content: { rendered: '<img src="http://diocletiansdream.com/wp-content/a.jpg">' } }]);
    // No wp-image-N class here, so there is no attachment to look alt up for —
    // the media round-trip should be skipped rather than fired and discarded.
    http.expectNone(isMedia);

    expect(got[0].content.rendered).toContain('https://cms.diocletiansdream.com/wp-content/a.jpg');
    expect(got[0].content.rendered).not.toContain('http://');
  });

  /**
   * Regression: one flaky request used to be fatal in a way nobody could see.
   * BlogPostPage turns a fetch error into "Post not found" + noindex, so a
   * single blip while prerendering silently deindexed that post and the build
   * still exited 0 — which is exactly what happened to one post on a CI build.
   */
  it('retries a failed post fetch rather than letting it become a noindex 404', (done) => {
    let got: any;
    service.getPostBySlug('x').subscribe({ next: (p) => (got = p), error: () => done.fail('errored') });

    // Fail the first attempt the way a WAF rejection would.
    http.expectOne(isPosts).flush('blocked', { status: 503, statusText: 'Service Unavailable' });

    setTimeout(() => {
      http.expectOne(isPosts).flush([{ slug: 'x', content: { rendered: '<p>Body</p>' } }]);

      expect(got?.[0]?.slug).withContext('the retry should have recovered the post').toBe('x');
      done();
    }, 400); // first backoff is 300ms
  });

  it('keeps the article when only the alt-text lookup fails', () => {
    let got: any;
    service.getPostBySlug('x').subscribe((p) => (got = p));

    http.expectOne(isPosts).flush([
      {
        content: {
          rendered: '<img class="wp-image-1" src="https://cms.diocletiansdream.com/a.jpg" alt="">',
        },
      },
    ]);
    // Alt text is a nice-to-have. Losing the media endpoint must not lose the body.
    http.expectOne(isMedia).flush('down', { status: 500, statusText: 'Error' });

    expect(got[0].content.rendered).toContain('wp-image-1');
  });

  afterEach(() => http.verify());
});
