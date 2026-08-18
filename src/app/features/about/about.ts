import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BlogInvite } from '../../shared/components/blog-invite/blog-invite';
import { OG_DEFAULT_IMAGE, PageSeoService } from '../../shared/services/page-seo';
import { SeoService } from '../../shared/services/seo-service';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';
import { LocalePathPipe } from '../../core/i18n/locale-path.pipe';
import { FaqEntry, StructuredDataService } from '../../shared/services/structured-data';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, TranslateModule, BlogInvite, RevealOnScrollDirective, LocalePathPipe],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit, OnDestroy {
  private static readonly JSON_LD_ID = 'ld-about';

  /**
   * Media coverage, verified against each live source on 2026-08-12.
   * Headlines and outlet names are citations, not UI copy, so they stay in the
   * language they were published in — only the action label is translated.
   * Logos live in `public/` and are served from the site root via <base href="/">.
   */
  readonly pressFeatures = [
    {
      href: 'https://mixed-news.com/en/diocletians-dream-vr-time-travel-to-ancient-split/',
      logo: 'mixed-news-logo.svg',
      headline: "Diocletian's Dream: A VR time travel to ancient Split",
      meta: 'MIXED Reality News · Tomislav Bezmalinovic · 2022',
      actionKey: 'aboutPage.media.readArticle',
    },
    {
      href: 'https://total-croatia-news.com/news/travel/diocletian-s-dram/',
      logo: 'total-croatia-news-logo.png',
      headline: "Diocletian's Dream: a Stunning VR Experience Bringing Split History to Life",
      meta: 'Total Croatia News · 2022',
      actionKey: 'aboutPage.media.readArticle',
    },
    {
      href: 'https://www.youtube.com/watch?v=mPwjl9dFSao',
      logo: 'youtube-logo.png',
      headline: 'Virtual Reality Diocletians Dream in Split Croatia',
      meta: 'YouTube · 45 Degrees Sailing · 2020',
      actionKey: 'aboutPage.media.watchVideo',
    },
  ];

  constructor(
    private pageSeo: PageSeoService,
    private seo: SeoService,
    private translate: TranslateService,
    private sd: StructuredDataService,
  ) {}

  ngOnInit(): void {
    this.pageSeo.applyLocalized('aboutPage', '/about');

    // Injected into <head> via SeoService, NOT via a <script> in the template:
    // Angular's compiler strips <script> from templates, so a template tag
    // silently emits nothing at all.
    this.seo.setJsonLd(About.JSON_LD_ID, this.buildGraph());
  }

  ngOnDestroy(): void {
    // <script> tags survive client-side navigation — drop it on the way out.
    this.seo.clearJsonLd(About.JSON_LD_ID);
  }

  /** Localized FAQ pairs, straight from the array the template renders. */
  private faqItems(): FaqEntry[] {
    const items = this.translate.instant('aboutPage.faq.items') as FaqEntry[];
    return Array.isArray(items) ? items.filter((item) => !!item?.q && !!item?.a) : [];
  }

  /**
   * `AboutPage` with the press coverage attached as `subjectOf`. Those three
   * articles are the site's only third-party citations, and naming them in the
   * graph is what turns "some outlets wrote about us" into checkable entity
   * evidence Google can follow.
   */
  private buildGraph(): unknown {
    const url = this.sd.url('/about');
    const title = this.translate.instant('aboutPage.seo.metaTitle') as string;
    const description = this.translate.instant('aboutPage.seo.metaDescription') as string;

    const organization = {
      ...this.sd.organization(),
      description,
      foundingLocation: {
        '@type': 'Place',
        name: 'Split, Croatia',
      },
      subjectOf: this.pressFeatures.map((feature) => ({
        '@type': feature.href.includes('youtube.com') ? 'VideoObject' : 'NewsArticle',
        name: feature.headline,
        url: feature.href,
      })),
    };

    return this.sd.graph([
      organization,
      this.sd.website(),
      this.sd.localBusiness(description),
      this.sd.webPage({
        type: 'AboutPage',
        url,
        name: title,
        description,
        primaryImage: this.sd.asset(OG_DEFAULT_IMAGE),
        breadcrumbId: `${url}#breadcrumb`,
        speakableSelectors: ['.faq-question', '.faq-answer'],
      }),
      this.sd.breadcrumb(url, [
        this.sd.homeCrumb(),
        { name: this.translate.instant('header.nav.about'), url },
      ]),
      this.sd.faqPage(url, this.faqItems()),
    ]);
  }
}
