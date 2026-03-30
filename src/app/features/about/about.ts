import { Component, OnInit } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { BlogInvite } from '../../shared/components/blog-invite/blog-invite';
import { SeoService } from '../../shared/services/seo-service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Header, Footer, TranslateModule, BlogInvite],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit{

    schemaJsonLd: SafeHtml = '';
  private sub?: Subscription;

    constructor(
    private title: Title,
    private meta: Meta,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
    private seo: SeoService,
  ) {}
  ngOnInit(): void {
    window.scroll(0, 0);
        this.applySeo(this.translate.currentLang || 'en');
    this.sub = this.translate.onLangChange.subscribe((e) => {
      this.applySeo(e.lang);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private applySeo(lang: string) {
    // META TITLE (from your notes)
    const metaTitle =
      lang === 'hr'
        ? 'O Diocletian’s Dream – VR muzej u Splitu'
        : 'About Diocletian’s Dream – Virtual Reality Museum in Split';

    // META DESCRIPTION (from your notes)
    const metaDescription =
      lang === 'hr'
        ? 'Saznajte više o Diocletian’s Dreamu, VR muzeju u Splitu koji kroz 3D rekonstrukciju i povijesna istraživanja prikazuje Dioklecijanovu palaču.'
        : 'Learn about Diocletian’s Dream, a virtual reality museum in Split presenting Diocletian’s Palace through immersive 3D reconstruction and historical research.';

    this.title.setTitle(metaTitle);
    this.seo.setCanonical('https://diocletiansdream.com/about');

    // Description
    this.meta.updateTag({ name: 'description', content: metaDescription });

    // Optional: canonical-ish social meta
    this.meta.updateTag({ property: 'og:title', content: metaTitle });
    this.meta.updateTag({ property: 'og:description', content: metaDescription });
    this.meta.updateTag({ name: 'twitter:title', content: metaTitle });
    this.meta.updateTag({ name: 'twitter:description', content: metaDescription });

    // JSON-LD schemas (Organization + LocalBusiness)
    const jsonLd = this.buildSchema();
    this.schemaJsonLd = this.sanitizer.bypassSecurityTrustHtml(jsonLd);
  }

  private buildSchema(): string {
    // NOTE: Replace googleBusinessUrl with the real one when you have it.
    // sameAs links we can already confirm:
    // Instagram: https://www.instagram.com/diocletiansdream/ :contentReference[oaicite:2]{index=2}
    // Facebook: https://www.facebook.com/diocletiansdream/ :contentReference[oaicite:3]{index=3}
    // TripAdvisor: https://www.tripadvisor.com/Attraction_Review-g295370-d20921353-Reviews-Diocletians_Dream-Split_Split_Dalmatia_County_Dalmatia.html :contentReference[oaicite:4]{index=4}

    const googleBusinessUrl = ''; // TODO

    const sameAs = [
      'https://www.instagram.com/diocletiansdream/',
      'https://www.facebook.com/diocletiansdream/',
      'https://www.tripadvisor.com/Attraction_Review-g295370-d20921353-Reviews-Diocletians_Dream-Split_Split_Dalmatia_County_Dalmatia.html',
      ...(googleBusinessUrl ? [googleBusinessUrl] : []),
    ];

    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: "Diocletian's Dream",
      url: 'https://diocletiansdream.com/',
      foundingDate: '2020',
      sameAs,
    };

    const localBusiness = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: "Diocletian's Dream",
      url: 'https://diocletiansdream.com/',
      foundingDate: '2020',
      image: 'https://diocletiansdream.com/wp-content/uploads/2023/10/cropped-cropped-gold-logo-1.png', // optional
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Zagrebačka ul. 1',
        addressLocality: 'Split',
        postalCode: '21000',
        addressCountry: 'HR',
      },
      sameAs,
    };

    // You can either output two separate <script> tags,
    // or a single array as below:
    return JSON.stringify([organization, localBusiness]);
  }
}
