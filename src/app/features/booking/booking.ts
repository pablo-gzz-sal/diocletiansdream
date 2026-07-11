import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { SeoService } from '../../shared/services/seo-service';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [Header, Footer, TranslateModule, RevealOnScrollDirective],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  faqList = [
    {
      q: 'bookingPage.faq.q1',
      a: 'bookingPage.faq.a1',
      open: false,
    },
    {
      q: 'bookingPage.faq.q2',
      a: 'bookingPage.faq.a2',
      open: false,
    },
    {
      q: 'bookingPage.faq.q3',
      a: 'bookingPage.faq.a3',
      open: false,
    },
    {
      q: 'bookingPage.faq.q4',
      a: 'bookingPage.faq.a4',
      open: false,
    },
    {
      q: 'bookingPage.faq.q5',
      a: 'bookingPage.faq.a5',
      open: false,
    },
  ];

  constructor(
    private title: Title,
    private meta: Meta,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
    private seo: SeoService,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    // SEO tags are set on both server and browser so crawlers see them.
    this.applySeo(this.translate.currentLang || 'en');

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

  private applySeo(lang: string) {
    // META TITLE (exactly your notes)
    const metaTitle =
      lang === 'hr'
        ? "Rezervirajte VR ulaznice za Dioklecijanovu palaču | Diocletians Dream Split"
        : "Book Diocletians dream VR Tickets | Diocletians Dream Split";

    // META DESCRIPTION (exactly your notes)
    const metaDescription =
      lang === 'hr'
        ? 'Rezervirajte 15-minutno VR iskustvo Dioklecijanove palače u Splitu. Odaberite termin i osigurajte ulaznice online.'
        : "Reserve your 15-minute Diocletians dream VR experience in Split. Choose your time slot and secure your tickets online.";

    this.title.setTitle(metaTitle);
    this.seo.setCanonical('https://diocletiansdream.com/booking');

    this.meta.updateTag({ name: 'description', content: metaDescription });
    this.seo.setRobots();

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: metaTitle });
    this.meta.updateTag({ property: 'og:description', content: metaDescription });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://diocletiansdream.com/booking/' });

    // Twitter
    this.meta.updateTag({ name: 'twitter:title', content: metaTitle });
    this.meta.updateTag({ name: 'twitter:description', content: metaDescription });

    // Optional JSON-LD later if you want (LocalBusiness already on About per Pablo note)
    // this.schemaJsonLd = JSON.stringify({...});
  }

  toggleFaq(item: any) {
    item.open = !item.open;
  }
}
