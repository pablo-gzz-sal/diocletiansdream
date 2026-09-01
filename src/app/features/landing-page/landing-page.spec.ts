import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { LandingPage } from './landing-page';
import { commonTestImports, commonTestProviders } from '../../../testing/test-setup';
import enTranslations from '../../../assets/i18n/en.json';
import hrTranslations from '../../../assets/i18n/hr.json';

describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;
  let translate: TranslateService;

  const featuredArticleTranslations = {
    en: {
      eyebrow: 'Explore beyond the palace',
      title: 'Stories from Split',
      intro: 'Continue discovering the people, places, and history that make this city remarkable.',
      readArticle: 'Read article',
      invite: 'Looking for more ways to explore Split? Visit our journal for local stories, practical guides, and a deeper look at the palace.',
      readMore: 'Read more articles',
      articles: {
        emperor: {
          title: 'Emperor Diocletian',
          intro: 'Meet the ruler whose retirement palace became the living heart of modern Split.',
          alt: 'Emperor Diocletian overlooking the imperial palace',
        },
        shopping: {
          title: 'Shopping in Split',
          intro: 'Find local markets, crafts, and souvenirs that make a thoughtful reminder of Split.',
          alt: 'Market stalls in the historic centre of Split',
        },
        ruins: {
          title: 'Hidden Roman ruins in Split',
          intro: 'Look beyond the familiar streets to uncover the Roman traces woven through the city.',
          alt: "Roman arches and columns within Diocletian's Palace",
        },
        palace: {
          title: "History of Diocletian's Palace",
          intro: 'Discover how an imperial residence became the historic centre visitors explore today.',
          alt: "Temple façade within Diocletian's Palace",
        },
      },
    },
    hr: {
      eyebrow: 'Istražite izvan palače',
      title: 'Priče iz Splita',
      intro: 'Nastavite otkrivati ljude, mjesta i povijest koji ovaj grad čine posebnim.',
      readArticle: 'Pročitaj članak',
      invite: 'Tražite još načina da istražite Split? Posjetite naš blog i otkrijte lokalne priče, praktične vodiče i dublji pogled na palaču.',
      readMore: 'Pročitaj još članaka',
      articles: {
        emperor: {
          title: 'Car Dioklecijan',
          intro: 'Upoznajte vladara čija je palača za umirovljenje postala živo srce današnjeg Splita.',
          alt: 'Car Dioklecijan promatra carsku palaču',
        },
        shopping: {
          title: 'Shopping u Splitu',
          intro: 'Otkrijte lokalne tržnice, rukotvorine i suvenire koji će vas podsjećati na Split.',
          alt: 'Tržnica u povijesnoj jezgri Splita',
        },
        ruins: {
          title: 'Skrivene rimske ruševine u Splitu',
          intro: 'Pogledajte iza poznatih ulica i otkrijte rimske tragove utkane u grad.',
          alt: 'Rimski lukovi i stupovi unutar Dioklecijanove palače',
        },
        palace: {
          title: 'Povijest Dioklecijanove palače',
          intro: 'Saznajte kako je carska rezidencija postala povijesna jezgra koju posjetitelji istražuju i danas.',
          alt: 'Pročelje hrama unutar Dioklecijanove palače',
        },
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      ...enTranslations,
      home: { ...enTranslations.home, featuredArticles: featuredArticleTranslations.en },
    });
    translate.setTranslation('hr', {
      ...hrTranslations,
      home: { ...hrTranslations.home, featuredArticles: featuredArticleTranslations.hr },
    });
    translate.use('en').subscribe();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('places historical authority between location and visitor testimonials', () => {
    const visit = fixture.nativeElement.querySelector('app-visit') as HTMLElement | null;
    const authority = fixture.nativeElement.querySelector(
      'app-historical-authority',
    ) as HTMLElement | null;
    const reviews = fixture.nativeElement.querySelector('app-reviews') as HTMLElement | null;

    expect(visit).not.toBeNull();
    expect(authority).not.toBeNull();
    expect(reviews).not.toBeNull();
    if (!visit || !authority || !reviews) {
      fail('Expected visit, historical authority, and reviews to render');
      return;
    }

    expect(visit.compareDocumentPosition(authority) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(authority.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows four fully linked featured articles after the FAQ', () => {
    translate.setTranslation('en', {
      home: { featuredArticles: featuredArticleTranslations.en },
    }, true);
    translate.use('en').subscribe();
    fixture.detectChanges();

    const featuredSection = fixture.nativeElement.querySelector(
      '[data-testid="featured-articles"]',
    ) as HTMLElement | null;
    const faq = fixture.nativeElement.querySelector('app-faq') as HTMLElement | null;

    expect(featuredSection).not.toBeNull();
    expect(faq).not.toBeNull();
    if (!featuredSection || !faq) {
      fail('Expected the FAQ and featured articles section to render');
      return;
    }

    const articleLinks = Array.from(
      featuredSection.querySelectorAll('[data-testid="featured-article"]'),
    ) as HTMLAnchorElement[];
    const expectedLinks = [
      '/what-you-didnt-know-about-emperor-diocletian/',
      '/a-locals-guide-to-shopping-in-split/',
      '/hidden-roman-ruins-in-split-you-probably-walked-past/',
      '/historical-significance-of-diocletians-palace/',
    ];
    const expectedImages = [
      'assets/images/vr/emperor-peristyle.jpg',
      'assets/images/vr/market-pottery.jpg',
      'assets/images/vr/trailer-stills/imperial-audience-hall.jpg',
      'assets/images/vr/temple-facade.jpg',
    ];

    expect(articleLinks.map((link) => link.getAttribute('href'))).toEqual(expectedLinks);
    expect(
      articleLinks.map((link) => link.querySelector('img')?.getAttribute('src')),
    ).toEqual(expectedImages);
    articleLinks.forEach((link) => {
      expect(link.querySelector('img')).not.toBeNull();
      expect(link.querySelector('h3')).not.toBeNull();
      expect(link.querySelector('p')).not.toBeNull();
    });
    const blogInvite = featuredSection.querySelector(
      '[data-testid="featured-articles-invite"]',
    ) as HTMLParagraphElement | null;
    const blogLink = featuredSection.querySelector(
      '[data-testid="featured-articles-blog-link"]',
    ) as HTMLAnchorElement | null;

    expect(blogInvite?.textContent).toContain('Looking for more ways to explore Split?');
    expect(blogLink?.getAttribute('href')).toBe('https://diocletiansdream.com/blog/');
    expect(faq.compareDocumentPosition(featuredSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders Croatian featured article copy and Croatian article destinations', () => {
    translate.use('hr').subscribe();
    fixture.detectChanges();

    const featuredSection = fixture.nativeElement.querySelector(
      '[data-testid="featured-articles"]',
    ) as HTMLElement;
    const articleLinks = Array.from(
      featuredSection.querySelectorAll('[data-testid="featured-article"]'),
    ) as HTMLAnchorElement[];

    expect(featuredSection.textContent).toContain('Istražite izvan palače');
    expect(featuredSection.textContent).toContain('Priče iz Splita');
    expect(articleLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/hr/sto-niste-znali-o-caru-dioklecijanu/',
      '/hr/lokalni-vodic-za-shopping-u-splitu/',
      '/hr/skrivene-rimske-rusevine-u-splitu/',
      '/hr/povijesni-znacaj-dioklecijanove-palace/',
    ]);
    expect(articleLinks.map((link) => link.querySelector('h3')?.textContent?.trim())).toEqual([
      'Car Dioklecijan',
      'Shopping u Splitu',
      'Skrivene rimske ruševine u Splitu',
      'Povijest Dioklecijanove palače',
    ]);
    articleLinks.forEach((link) => expect(link.textContent).toContain('Pročitaj članak'));
    expect(featuredSection.textContent).toContain('Tražite još načina da istražite Split?');
    expect(
      featuredSection.querySelector('[data-testid="featured-articles-blog-link"]')?.getAttribute('href'),
    ).toBe('https://diocletiansdream.com/hr/blog/');
  });
});
