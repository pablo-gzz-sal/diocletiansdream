import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { SeoService } from '../../shared/services/seo-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Trailer } from '../../core/components/trailer/trailer';
import { Experience } from '../../core/components/experience/experience';
import { Visit } from '../../core/components/visit/visit';
import { Reviews } from '../../core/components/reviews/reviews';
import { Faq } from '../../core/components/faq/faq';
import { Highlights } from '../../core/components/highlights/highlights';
import { HistoricalAuthority } from '../../core/components/historical-authority/historical-authority';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OG_DEFAULT_IMAGE, PageSeoService } from '../../shared/services/page-seo';
import { FaqEntry, StructuredDataService } from '../../shared/services/structured-data';
import { shouldDisableMotion } from '../../shared/animations/motion-preference';
import { I18nService } from '../../core/i18n/i18n.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [Header,
    Footer,
    Trailer,
    Experience,
    Visit,
    HistoricalAuthority,
    Reviews,
    Faq,
    Highlights,
    TranslateModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('spotlight', { static: true }) spotRef!: ElementRef<HTMLElement>;

  marqueeItems: string[] = [];

  readonly featuredArticles = [
    {
      key: 'emperor',
      href: {
        en: '/what-you-didnt-know-about-emperor-diocletian/',
        hr: '/hr/sto-niste-znali-o-caru-dioklecijanu/',
      },
      image: 'assets/images/vr/emperor-peristyle.jpg',
    },
    {
      key: 'shopping',
      href: {
        en: '/a-locals-guide-to-shopping-in-split/',
        hr: '/hr/lokalni-vodic-za-shopping-u-splitu/',
      },
      image: 'assets/images/vr/market-pottery.jpg',
    },
    {
      key: 'ruins',
      href: {
        en: '/hidden-roman-ruins-in-split-you-probably-walked-past/',
        hr: '/hr/skrivene-rimske-rusevine-u-splitu/',
      },
      image: 'assets/images/vr/trailer-stills/imperial-audience-hall.jpg',
    },
    {
      key: 'palace',
      href: {
        en: '/historical-significance-of-diocletians-palace/',
        hr: '/hr/povijesni-znacaj-dioklecijanove-palace/',
      },
      image: 'assets/images/vr/temple-facade.jpg',
    },
  ];

  private cleanups: Array<() => void> = [];

  private static readonly JSON_LD_ID = 'ld-home';

  constructor(
    private seo: SeoService,
    private translate: TranslateService,
    private i18n: I18nService,
    private pageSeo: PageSeoService,
    private sd: StructuredDataService,
  ) {}

  featuredArticleHref(article: typeof this.featuredArticles[number]): string {
    return article.href[this.i18n.current()];
  }

  featuredArticlesBlogHref(): string {
    return this.i18n.current() === 'hr'
      ? 'https://diocletiansdream.com/hr/blog/'
      : 'https://diocletiansdream.com/blog/';
  }

  ngOnInit(): void {
    this.applySeo();
    this.translate.get('home.marquee.items').subscribe((items: string[]) => {
      this.marqueeItems = items;
    });
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const reduced = shouldDisableMotion();

    if (reduced) return;

    // ── ScrollTrigger global refresh ─────────────────────────────
    // After Angular finishes rendering all child components, recalculate
    // all trigger positions so nothing fires at the wrong scroll offset.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });

    // ── Cursor spotlight: smooth GSAP lag behind the mouse ──────
    const spot = this.spotRef.nativeElement;
    const qx = gsap.quickTo(spot, 'x', { duration: 0.45, ease: 'power2.out' });
    const qy = gsap.quickTo(spot, 'y', { duration: 0.45, ease: 'power2.out' });

    let entered = false;
    const onMove = (e: MouseEvent) => {
      if (!entered) {
        spot.style.opacity = '1';
        entered = true;
      }
      qx(e.clientX);
      qy(e.clientY);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    this.cleanups.push(() => document.removeEventListener('mousemove', onMove));
  }

  ngOnDestroy(): void {
    this.cleanups.forEach(fn => fn());
    this.cleanups = [];
    // <script> tags survive client-side navigation — drop it on the way out.
    this.seo.clearJsonLd(LandingPage.JSON_LD_ID);
  }

  /** The home FAQ pairs, resolved from the same i18n keys the accordion renders. */
  private faqItems(): FaqEntry[] {
    return Faq.KEYS.map((key) => ({
      q: this.translate.instant(`home.faq.items.${key}.q`) as string,
      a: this.translate.instant(`home.faq.items.${key}.a`) as string,
    })).filter((item) => !!item.q && !!item.a);
  }

  private applySeo(): void {
    this.pageSeo.applyLocalized('home', '/');
    // The hero still is painted as a CSS background behind the Vimeo player.
    this.seo.setPreloadImage('/assets/images/vr/trailer-stills/diocletians-bedchamber.jpg');

    const description = this.translate.instant('home.seo.metaDescription') as string;
    const title = this.translate.instant('home.seo.metaTitle') as string;
    const url = this.sd.url('/');
    const image = this.sd.asset(OG_DEFAULT_IMAGE);

    // One graph, not four schema islands. Organization / WebSite /
    // LocalBusiness are declared here with stable @ids that every other page
    // then references instead of redeclaring, so Google resolves one business
    // across the site rather than one per page.
    this.seo.setJsonLd(
      LandingPage.JSON_LD_ID,
      this.sd.graph([
        this.sd.organization(),
        this.sd.website(),
        this.sd.localBusiness(description),
        this.sd.webPage({
          url,
          name: title,
          description,
          primaryImage: image,
          breadcrumbId: `${url}#breadcrumb`,
          speakableSelectors: ['.trailer-h1', '.trailer-sub', '.faq-a p'],
        }),
        this.sd.breadcrumb(url, [this.sd.homeCrumb()]),
        this.sd.faqPage(url, this.faqItems()),
      ]),
    );
  }
}
