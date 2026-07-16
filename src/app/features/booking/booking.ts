import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { TranslateModule } from '@ngx-translate/core';
import { PageSeoService } from '../../shared/services/page-seo';
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
    private pageSeo: PageSeoService,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    // SEO tags are set on both server and browser so crawlers see them.
    this.pageSeo.applyLocalized('bookingPage', '/booking');

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


  toggleFaq(item: any) {
    item.open = !item.open;
  }
}
