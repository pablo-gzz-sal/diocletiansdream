import { fetchAllPostSlugs } from './app.routes.server';

/**
 * The prerender slug fetch is the single point where a build can go quietly
 * wrong: an empty list produces a dist with no blog posts, which deploys as a
 * site whose entire blog 404s. These tests pin the failure modes that actually
 * happened rather than the ones that are easy to imagine.
 */
describe('fetchAllPostSlugs', () => {
  /** Minimal Response stand-in — only the members the fetch path touches. */
  const respond = (
    body: unknown,
    { status = 200, type = 'application/json; charset=UTF-8' } = {}
  ) =>
    ({
      ok: status >= 200 && status < 300,
      status,
      headers: { get: (h: string) => (h.toLowerCase() === 'content-type' ? type : null) },
      json: async () => {
        if (typeof body === 'string') throw new SyntaxError("Unexpected token '<'");
        return body;
      },
    }) as unknown as Response;

  /** Hands back one response per fetch call, in order. */
  const stubFetch = (...responses: Response[]) =>
    spyOn(globalThis, 'fetch').and.returnValues(
      ...responses.map((r) => Promise.resolve(r))
    );

  it('collects slugs across pages until a short page ends the walk', async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => ({ slug: `post-${i}` }));
    stubFetch(respond(page1), respond([{ slug: 'last' }]));

    const slugs = await fetchAllPostSlugs('en');

    expect(slugs.length).toBe(101);
    expect(slugs[100]).toBe('last');
  });

  it('stops cleanly at the 400 WordPress returns past the last page', async () => {
    stubFetch(respond([{ slug: 'only' }], { status: 400 }));

    await expectAsync(fetchAllPostSlugs('en')).toBeResolvedTo([]);
  });

  /**
   * SiteGround's Anti-Bot AI answers /wp-json/ with 202 and an HTML
   * interstitial. `res.ok` is true for 202, so the old code fell straight into
   * json(), swallowed the parse error, and returned zero slugs.
   */
  it('rejects a WAF challenge that answers 202 with HTML', async () => {
    stubFetch(respond('<html><head><meta http-equiv="refresh"></head></html>', {
      status: 202,
      type: 'text/html',
    }));

    await expectAsync(fetchAllPostSlugs('en')).toBeRejectedWithError(/expected JSON, got "text\/html"/);
  });

  it('rejects a server error rather than prerendering an empty blog', async () => {
    stubFetch(respond([], { status: 503, type: 'text/html' }));

    await expectAsync(fetchAllPostSlugs('en')).toBeRejectedWithError(/HTTP 503/);
  });

  it('propagates a network failure instead of returning no slugs', async () => {
    spyOn(globalThis, 'fetch').and.rejectWith(new TypeError('fetch failed'));

    await expectAsync(fetchAllPostSlugs('en')).toBeRejectedWithError(/fetch failed/);
  });
});
