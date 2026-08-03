import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostPage } from './blog-post-page';
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
});
