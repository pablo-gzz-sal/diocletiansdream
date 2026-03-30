import { Component, OnInit } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { BlogInvite } from '../../shared/components/blog-invite/blog-invite';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { SeoService } from '../../shared/services/seo-service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [Header, Footer, BlogInvite, TranslateModule],
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
  ) {}

  ngOnInit(): void {
    // existing title/meta code...
    window.scroll(0, 0);
    // Load Turitop after component renders
    const script = document.createElement('script');
    script.id = 'js-turitop';
    script.src = 'https://app.turitop.com/js/load-turitop.min.js'; // your full src URL
    script.async = true;
    document.body.appendChild(script);

    this.applySeo(this.translate.currentLang || 'en');
  }

  private applySeo(lang: string) {
    // META TITLE (exactly your notes)
    const metaTitle =
      lang === 'hr'
        ? 'Rezervirajte VR ulaznice za Dioklecijanovu palaču | Diocletian’s Dream Split'
        : 'Book Diocletian’s Palace VR Tickets | Diocletian’s Dream Split';

    // META DESCRIPTION (exactly your notes)
    const metaDescription =
      lang === 'hr'
        ? 'Rezervirajte 15-minutno VR iskustvo Dioklecijanove palače u Splitu. Odaberite termin i osigurajte ulaznice online.'
        : 'Reserve your 15-minute Diocletian’s Palace VR experience in Split. Choose your time slot and secure your tickets online.';

    this.title.setTitle(metaTitle);
    this.seo.setCanonical('https://diocletiansdream.com/booking');

    this.meta.updateTag({ name: 'description', content: metaDescription });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: metaTitle });
    this.meta.updateTag({ property: 'og:description', content: metaDescription });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://diocletiansdream.com/booking' });

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
