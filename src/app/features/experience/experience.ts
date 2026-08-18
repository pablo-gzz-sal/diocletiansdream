import { Component, OnDestroy, OnInit } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { BlogInvite } from '../../shared/components/blog-invite/blog-invite';
import { OG_DEFAULT_IMAGE, PageSeoService } from '../../shared/services/page-seo';
import { SeoService } from '../../shared/services/seo-service';
import { I18nService } from '../../core/i18n/i18n.service';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';
import { LocalePathPipe } from '../../core/i18n/locale-path.pipe';
import { FaqEntry, ID, StructuredDataService } from '../../shared/services/structured-data';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [Header, Footer, CommonModule, TranslateModule, RouterLink, BlogInvite, RevealOnScrollDirective, LocalePathPipe],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience implements OnInit, OnDestroy {
  /** Public Vimeo page and embed for the trailer shown directly beneath the hero. */
  readonly videoPageUrl = 'https://vimeo.com/1217274878';
  readonly videoEmbedUrl = 'https://player.vimeo.com/video/1217274878';

  private static readonly JSON_LD_ID = 'ld-experience';

  constructor(
    private translate: TranslateService,
    private pageSeo: PageSeoService,
    private seo: SeoService,
    private i18n: I18nService,
    private sd: StructuredDataService,
  ) {}

  ngOnInit(): void {
    this.pageSeo.applyLocalized('experiencePage', '/experience');
    this.seo.setPreloadImage('/assets/images/vr/great-hall.jpg');

    // Injected into <head> via SeoService, NOT via a <script> in the template:
    // Angular's compiler strips <script> from templates, so a template tag
    // silently emits nothing at all.
    this.seo.setJsonLd(Experience.JSON_LD_ID, this.buildGraph());
  }

  ngOnDestroy(): void {
    // <script> tags survive client-side navigation — drop it on the way out.
    this.seo.clearJsonLd(Experience.JSON_LD_ID);
  }

  /** Localized FAQ pairs, straight from the array the template renders. */
  private faqItems(): FaqEntry[] {
    const items = this.translate.instant('experiencePage.faq.items') as FaqEntry[];
    return Array.isArray(items) ? items.filter((item) => !!item?.q && !!item?.a) : [];
  }

  private buildGraph(): unknown {
    const url = this.sd.url('/experience');
    const lang = this.i18n.current();
    const title = this.translate.instant('experiencePage.seo.metaTitle') as string;
    const description = this.translate.instant('experiencePage.seo.metaDescription') as string;
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
        speakableSelectors: ['.faq-question', '.faq-answer'],
      }),
      this.sd.breadcrumb(url, [
        this.sd.homeCrumb(),
        { name: this.translate.instant('header.nav.experience'), url },
      ]),
      this.sd.ticketProduct({
        url,
        name: this.translate.instant('experiencePage.hero.title'),
        description: this.translate.instant('experiencePage.hero.p1'),
        image,
      }),
      this.sd.faqPage(url, this.faqItems()),
      this.videoObject(url, lang, description),
      // The historian who advised on the reconstruction, named on the home page.
      // A real, checkable person is worth more to E-E-A-T than any tag on the
      // page. `sameAs` stays empty until someone confirms a canonical profile.
      {
        '@type': 'Person',
        '@id': `${ID.organization}-advisor`,
        name: 'Josip Belamarić',
        honorificPrefix: this.translate.instant('home.authority.honorific'),
        jobTitle: 'Art historian',
        knowsAbout: [
          "Diocletian's Palace",
          'Late Roman architecture',
          'Croatian cultural heritage',
        ],
        affiliation: {
          '@type': 'Organization',
          name: 'Croatian Academy of Sciences and Arts',
          sameAs: 'https://www.hazu.hr/',
        },
      },
    ]);
  }

  /**
   * The Vimeo trailer. `uploadDate` is required for a video rich result, and
   * `thumbnailUrl` has to resolve to a real image or Google drops the node.
   */
  private videoObject(pageUrl: string, lang: string, fallbackText: string) {
    return {
      '@type': 'VideoObject',
      '@id': `${pageUrl}#trailer`,
      name: this.translate.instant('experiencePage.trailer.title') || 'Experience trailer',
      description: this.translate.instant('experiencePage.trailer.text') || fallbackText,
      inLanguage: lang === 'hr' ? 'hr-HR' : 'en-US',
      thumbnailUrl: [this.sd.asset(OG_DEFAULT_IMAGE)],
      uploadDate: '2026-08-11',
      contentUrl: this.videoPageUrl,
      embedUrl: this.videoEmbedUrl,
      isPartOf: { '@id': `${pageUrl}#webpage` },
      publisher: { '@id': ID.organization },
    };
  }
}
