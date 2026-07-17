import { TestBed } from '@angular/core/testing';
import { attachmentId, attachmentIdsIn, WpContentService } from './wp-content';

/** Shaped like the real payload: two near-identical Elementor variants. */
const DUPLICATED = `
  <section class="elementor-section elementor-top-section elementor-hidden-desktop">
    <div class="elementor-widget"><p>Diocletian was born in Dalmatia.</p>
    <img class="wp-image-666 aligncenter" src="https://cms.example.com/bust.webp" alt="" /></div>
  </section>
  <section class="elementor-section elementor-top-section elementor-hidden-tablet elementor-hidden-mobile">
    <div class="elementor-widget"><p>Diocletian was born in Dalmatia.</p>
    <img class="wp-image-666 aligncenter" src="https://cms.example.com/bust.webp" alt="" /></div>
  </section>
`;

const NO_VARIANTS = `<div class="elementor-widget"><p>Just one copy.</p></div>`;

describe('WpContentService', () => {
  let service: WpContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WpContentService);
  });

  const occurrences = (haystack: string, needle: string) => haystack.split(needle).length - 1;

  it('renders a duplicated post body only once', () => {
    const out = service.clean(DUPLICATED);

    expect(occurrences(out, 'Diocletian was born in Dalmatia.'))
      .withContext('the article body still appears twice')
      .toBe(1);
  });

  it('keeps the desktop variant and drops the mobile one', () => {
    const out = service.clean(DUPLICATED);

    expect(out).not.toContain('elementor-hidden-desktop');
    // The survivor must not still claim to be hidden, or shipping Elementor's
    // stylesheet later would blank the article.
    expect(out).not.toContain('elementor-hidden-tablet');
    expect(out).not.toContain('elementor-hidden-mobile');
  });

  it('drops the mobile variant regardless of which one comes first', () => {
    // The two affected posts carry the variants in opposite order, so anything
    // position-based would delete the wrong copy on one of them.
    const reversed = DUPLICATED.split('<section')
      .filter(Boolean)
      .reverse()
      .map((s) => `<section${s}`)
      .join('');

    const out = service.clean(reversed);

    expect(occurrences(out, 'Diocletian was born in Dalmatia.')).toBe(1);
    expect(out).not.toContain('elementor-hidden-desktop');
  });

  it('leaves a post with no variants untouched', () => {
    const out = service.clean(NO_VARIANTS);

    expect(out).toContain('Just one copy.');
    expect(occurrences(out, 'Just one copy.')).toBe(1);
  });

  it('backfills alt text from the media library', () => {
    const out = service.clean(DUPLICATED, new Map([[666, 'Marble bust of Emperor Diocletian']]));

    expect(out).toContain('alt="Marble bust of Emperor Diocletian"');
  });

  it('does not overwrite alt text the editor already set', () => {
    const html = '<img class="wp-image-666" src="x.jpg" alt="Author\'s own words" />';

    expect(service.clean(html, new Map([[666, 'From the library']]))).toContain(
      'alt="Author\'s own words"',
    );
  });

  it('leaves alt empty when the media library has nothing to offer', () => {
    // Today every alt_text in the library is blank, so this is the live case.
    const out = service.clean(DUPLICATED, new Map([[666, '   ']]));

    expect(out).toContain('alt=""');
  });

  it('handles empty content', () => {
    expect(service.clean('')).toBe('');
  });
});

describe('attachmentId', () => {
  it('reads the id out of the wp-image class', () => {
    expect(attachmentId('wp-image-666 aligncenter')).toBe(666);
    expect(attachmentId('aligncenter wp-image-42')).toBe(42);
  });

  it('returns null when there is no attachment class', () => {
    expect(attachmentId('aligncenter')).toBeNull();
    // Must not match a class that merely starts the same way.
    expect(attachmentId('wp-image-large')).toBeNull();
  });
});

describe('attachmentIdsIn', () => {
  it('collects each referenced attachment once', () => {
    expect(attachmentIdsIn(DUPLICATED)).toEqual([666]);
  });

  it('returns nothing for content with no images', () => {
    expect(attachmentIdsIn(NO_VARIANTS)).toEqual([]);
  });
});
