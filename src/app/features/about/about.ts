import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { TranslateModule } from '@ngx-translate/core';
import { BlogInvite } from '../../shared/components/blog-invite/blog-invite';
import { PageSeoService } from '../../shared/services/page-seo';
import { SeoService } from '../../shared/services/seo-service';
import { environment } from '../../../environments/environment';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';
import { LocalePathPipe } from '../../core/i18n/locale-path.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, TranslateModule, BlogInvite, RevealOnScrollDirective, LocalePathPipe],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit, OnDestroy {
  private static readonly JSON_LD_IDS = ['ld-about-organization', 'ld-about-local-business'];

  constructor(
    private pageSeo: PageSeoService,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.pageSeo.applyLocalized('aboutPage', '/about');

    // Injected into <head> via SeoService, NOT via a <script> in the template:
    // Angular's compiler strips <script> from templates, so a template tag
    // silently emits nothing at all.
    const [organization, localBusiness] = this.buildSchemas();
    this.seo.setJsonLd('ld-about-organization', organization);
    this.seo.setJsonLd('ld-about-local-business', localBusiness);
  }

  ngOnDestroy(): void {
    // <script> tags survive client-side navigation — drop them on the way out.
    for (const id of About.JSON_LD_IDS) this.seo.clearJsonLd(id);
  }

  private buildSchemas(): [unknown, unknown] {
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
      name: "Diocletians Dream",
      url: 'https://diocletiansdream.com/',
      foundingDate: '2020',
      sameAs,
    };

    const localBusiness = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: "Diocletians Dream",
      url: 'https://diocletiansdream.com/',
      foundingDate: '2020',
      image: `${environment.siteUrl.replace(/\/+$/, '')}/assets/images/ddLogo.png`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Zagrebačka ul. 1',
        addressLocality: 'Split',
        postalCode: '21000',
        addressCountry: 'HR',
      },
      sameAs,
    };

    return [organization, localBusiness];
  }
}
