import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OG_DEFAULT_IMAGE, PageSeoService } from '../../shared/services/page-seo';
import { SeoService } from '../../shared/services/seo-service';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';
import { FaqEntry, StructuredDataService } from '../../shared/services/structured-data';
import { LocalePathPipe } from '../../core/i18n/locale-path.pipe';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [Header, Footer, TranslateModule, RevealOnScrollDirective, LocalePathPipe],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit, OnDestroy {
  private static readonly JSON_LD_ID = 'ld-booking';

  constructor(
    private pageSeo: PageSeoService,
    private seo: SeoService,
    private translate: TranslateService,
    private sd: StructuredDataService,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  /**
   * Localized FAQ pairs, read straight from i18n so the rendered questions and
   * the FAQPage schema can never drift apart.
   */
  faqItems(): FaqEntry[] {
    const items = this.translate.instant('bookingPage.faq.items') as FaqEntry[];
    return Array.isArray(items) ? items.filter((item) => !!item?.q && !!item?.a) : [];
  }

  ngOnInit(): void {
    // SEO tags are set on both server and browser so crawlers see them.
    this.pageSeo.applyLocalized('bookingPage', '/booking');
    this.seo.setJsonLd(Booking.JSON_LD_ID, this.buildGraph());

    // The Turitop widget and scroll reset are browser-only.
    if (isPlatformBrowser(this.platformId)) {
      window.scroll(0, 0);
      // Load Turitop after component renders
      const script = this.doc.createElement('script');
      script.id = 'js-turitop';
      script.src = 'https://app.turitop.com/js/load-turitop.min.js'; // your full src URL
      script.async = true;
      this.doc.body.appendChild(script);
    }
  }

  ngOnDestroy(): void {
    // <script> tags survive client-side navigation — drop it on the way out.
    this.seo.clearJsonLd(Booking.JSON_LD_ID);
  }

  /**
   * The booking page is the only page that can legitimately carry Product +
   * Offer: it is where a visitor buys. Price in the graph is what puts "€13" in
   * an AI Overview answer to "how much is Diocletian's Dream".
   */
  private buildGraph(): unknown {
    const url = this.sd.url('/booking');
    const title = this.translate.instant('bookingPage.seo.metaTitle') as string;
    const description = this.translate.instant('bookingPage.seo.metaDescription') as string;
    const image = this.sd.asset(OG_DEFAULT_IMAGE);

    return this.sd.graph([
      this.sd.organization(),
      this.sd.website(),
      this.sd.localBusiness(description),
      this.sd.webPage({
        url,
        name: title,
        description,
        primaryImage: image,
        breadcrumbId: `${url}#breadcrumb`,
        speakableSelectors: ['.booking-hero__h1', '.booking-hero__sub', '.bfaq-a'],
      }),
      this.sd.breadcrumb(url, [
        this.sd.homeCrumb(),
        { name: this.translate.instant('footer.explore.booking'), url },
      ]),
      this.sd.ticketProduct({
        url,
        name: this.translate.instant('bookingPage.widget.title'),
        description: this.translate.instant('bookingPage.hero.text'),
        image,
      }),
      this.sd.faqPage(url, this.faqItems()),
    ]);
  }

  scrollToWidget(event: Event): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;
    this.doc
      .getElementById('booking-widget')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
