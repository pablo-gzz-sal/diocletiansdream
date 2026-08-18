import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OG_DEFAULT_IMAGE, PageSeoService } from '../../shared/services/page-seo';
import { SeoService } from '../../shared/services/seo-service';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';
import { LocalePathPipe } from '../../core/i18n/locale-path.pipe';
import { FaqEntry, StructuredDataService } from '../../shared/services/structured-data';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, TranslateModule, RevealOnScrollDirective, LocalePathPipe],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit, OnDestroy {
  /**
   * Google Maps place link for the venue, matching the one on the booking page.
   * Used for the "Get directions" button and for `hasMap` in the page graph, so
   * a visitor and a crawler are pointed at the same place.
   */
  readonly directionsUrl = 'https://maps.app.goo.gl/ypBTY6gDES6HWmPE6';

  private static readonly JSON_LD_ID = 'ld-visit';

  constructor(
    private pageSeo: PageSeoService,
    private seo: SeoService,
    private translate: TranslateService,
    private sd: StructuredDataService,
  ) {}

  ngOnInit(): void {
    this.pageSeo.applyLocalized('visitPage', '/visit');
    this.seo.setPreloadImage('/assets/images/vr/trailer-stills/vaulted-palace-substructures.jpg');

    // Injected into <head> via SeoService, NOT via a <script> in the template:
    // Angular's compiler strips <script> from templates, so a template tag
    // silently emits nothing at all.
    this.seo.setJsonLd(Contact.JSON_LD_ID, this.buildGraph());
  }

  ngOnDestroy(): void {
    // <script> tags survive client-side navigation — drop it on the way out.
    this.seo.clearJsonLd(Contact.JSON_LD_ID);
  }

  /** Localized FAQ pairs, straight from the array the template renders. */
  private faqItems(): FaqEntry[] {
    const items = this.translate.instant('visitPage.faq.items') as FaqEntry[];
    return Array.isArray(items) ? items.filter((item) => !!item?.q && !!item?.a) : [];
  }

  /**
   * Typed `ContactPage`, because this is where address, hours and directions
   * live. The LocalBusiness node it references carries the seasonal opening
   * hours, which is what Google and the assistants read when someone asks
   * whether Diocletian's Dream is open right now.
   */
  private buildGraph(): unknown {
    const url = this.sd.url('/visit');
    const title = this.translate.instant('visitPage.seo.metaTitle') as string;
    const description = this.translate.instant('visitPage.seo.metaDescription') as string;

    return this.sd.graph([
      this.sd.organization(),
      this.sd.website(),
      this.sd.localBusiness(description),
      this.sd.webPage({
        type: 'ContactPage',
        url,
        name: title,
        description,
        primaryImage: this.sd.asset(OG_DEFAULT_IMAGE),
        breadcrumbId: `${url}#breadcrumb`,
        speakableSelectors: ['.faq-question', '.faq-answer'],
      }),
      this.sd.breadcrumb(url, [
        this.sd.homeCrumb(),
        { name: this.translate.instant('header.nav.visit'), url },
      ]),
      this.sd.faqPage(url, this.faqItems()),
    ]);
  }
}
