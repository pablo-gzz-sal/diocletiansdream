import { PostLanguageRouteService } from './post-language-route.service';

describe('PostLanguageRouteService', () => {
  let service: PostLanguageRouteService;

  beforeEach(() => {
    service = new PostLanguageRouteService();
  });

  it('returns the Croatian route for a registered English post', () => {
    service.register('/diocletians-palace-vr-experience/?ref=header#top', {
      en: 'diocletians-palace-vr-experience',
      hr: 'vr-iskustvo-dioklecijanova-palaca',
    });

    expect(service.destinationFor('/diocletians-palace-vr-experience/', 'hr')).toBe(
      '/hr/vr-iskustvo-dioklecijanova-palaca',
    );
  });

  it('returns the English route for a registered Croatian post', () => {
    service.register('/hr/vr-iskustvo-dioklecijanova-palaca/', {
      en: 'diocletians-palace-vr-experience',
      hr: 'vr-iskustvo-dioklecijanova-palaca',
    });

    expect(service.destinationFor('/hr/vr-iskustvo-dioklecijanova-palaca?from=language', 'en')).toBe(
      '/diocletians-palace-vr-experience',
    );
  });

  it('does not return a destination for a stale route', () => {
    service.register('/current-post', { en: 'current-post', hr: 'trenutni-post' });

    expect(service.destinationFor('/other-post', 'hr')).toBeNull();
  });

  it('does not return a destination when the target translation is incomplete', () => {
    service.register('/current-post', { en: 'current-post', hr: '' });

    expect(service.destinationFor('/current-post', 'hr')).toBeNull();
  });

  it('does not return a destination for an invalid target slug', () => {
    service.register('/current-post', { en: 'current-post', hr: 'nested/slug' });

    expect(service.destinationFor('/current-post', 'hr')).toBeNull();
  });

  it('does not return a destination for malformed percent encoding', () => {
    service.register('/current-post', { en: 'current-post', hr: '%ZZ' });

    expect(service.destinationFor('/current-post', 'hr')).toBeNull();
  });

  it('does not return a destination for a matrix parameter delimiter', () => {
    service.register('/current-post', { en: 'current-post', hr: 'post;draft=true' });

    expect(service.destinationFor('/current-post', 'hr')).toBeNull();
  });

  it('does not return a destination for unsafe path grammar', () => {
    for (const slug of ['post(title)', '.', '..', '%2Fother-post', '%3Bdraft']) {
      service.register('/current-post', { en: 'current-post', hr: slug });

      expect(service.destinationFor('/current-post', 'hr')).withContext(slug).toBeNull();
    }
  });

  it('does not return a destination for a runtime non-string translation value', () => {
    service.register('/current-post', { en: 'current-post', hr: 42 } as unknown as { en: string; hr: string });

    expect(service.destinationFor('/current-post', 'hr')).toBeNull();
  });

  it('forgets the registered route when cleared', () => {
    service.register('/current-post', { en: 'current-post', hr: 'trenutni-post' });
    service.clear();

    expect(service.destinationFor('/current-post', 'hr')).toBeNull();
  });
});
