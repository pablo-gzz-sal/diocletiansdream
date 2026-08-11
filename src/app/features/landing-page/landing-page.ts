import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { SeoService } from '../../shared/services/seo-service';
import { TranslateService } from '@ngx-translate/core';
import { Trailer } from '../../core/components/trailer/trailer';
import { Experience } from '../../core/components/experience/experience';
import { Visit } from '../../core/components/visit/visit';
import { Reviews } from '../../core/components/reviews/reviews';
import { Faq } from '../../core/components/faq/faq';
import { Highlights } from '../../core/components/highlights/highlights';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OG_DEFAULT_IMAGE, PageSeoService } from '../../shared/services/page-seo';
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
    Reviews,
    Faq,
    Highlights],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('spotlight', { static: true }) spotRef!: ElementRef<HTMLElement>;

  marqueeItems: string[] = [];

  private cleanups: Array<() => void> = [];

  constructor(
    private seo: SeoService,
    private translate: TranslateService,
    private pageSeo: PageSeoService,
    private i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.applySeo();
    this.translate.get('home.marquee.items').subscribe((items: string[]) => {
      this.marqueeItems = items;
    });
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── ScrollTrigger global refresh ─────────────────────────────
    // After Angular finishes rendering all child components, recalculate
    // all trigger positions so nothing fires at the wrong scroll offset.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });

    if (reduced) return;

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
  }

  private applySeo(): void {
    this.pageSeo.applyLocalized('home', '/');

    const description = this.translate.instant('home.seo.metaDescription') as string;
    const lang = this.i18n.current();

    this.seo.setJsonLd('ld-local-business', {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'TouristAttraction'],
      name: "Diocletians Dream VR Museum",
      description,
      inLanguage: lang,
      image: this.pageSeo.absolute(OG_DEFAULT_IMAGE),
      url: this.pageSeo.urlFor('/'),
      telephone: '+38521886015',
      email: 'contact@diocletiansdream.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Zagrebačka ul. 1',
        addressLocality: 'Split',
        postalCode: '21000',
        addressCountry: 'HR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 43.5081,
        longitude: 16.4402,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '11:00',
          closes: '16:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/diocletiansdream/',
        'https://www.facebook.com/diocletiansdream/',
        'https://www.tripadvisor.com/Attraction_Review-g295370-d20921353',
      ],
    });
  }
}
