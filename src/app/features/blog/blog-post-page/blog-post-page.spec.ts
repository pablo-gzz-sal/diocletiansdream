import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BlogPostPage } from './blog-post-page';
import { SeoService } from '../../../shared/services/seo-service';
import { WpService } from '../../../shared/services/wp-service';
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

describe('BlogPostPage', () => {
  let component: BlogPostPage;
  let fixture: ComponentFixture<BlogPostPage>;

  /** The title is picked by a private helper; drive it directly. */
  const pickTitle = (lang: 'en' | 'hr', post: unknown) => {
    (component as any).lang = lang;
    return (component as any).pickSeoTitle(post) as string;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostPage, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the lightbox when an editorial image is clicked', () => {
    component.loading = false;
    component.post = {
      date: '2026-08-11T00:00:00.000Z',
      title: { rendered: 'Gallery post' },
      content: {
        rendered: '<figure class="wp-block-gallery"><figure class="wp-block-image"><img src="https://example.com/gallery.jpg" alt="Gallery visitor" /></figure></figure>',
      },
    };
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.blog-prose img') as HTMLImageElement;
    image.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const lightbox = fixture.nativeElement.querySelector('.blog-gallery-lightbox') as HTMLElement | null;
    expect(lightbox).not.toBeNull();
    expect(lightbox?.querySelector('img')?.getAttribute('src')).toBe('https://example.com/gallery.jpg');
  });

  it('takes the Croatian title from og_title when the Yoast SEO title is English', () => {
    expect(pickTitle('hr', HR_POST_WITH_ENGLISH_YOAST_TITLE)).toBe(
      'Zašto je VR iskustvo jedan od najboljih načina da upoznate Dioklecijanovu palaču | Diocletians Dream'
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
      'Tko je bio Dioklecijan? | Diocletians Dream'
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
});
