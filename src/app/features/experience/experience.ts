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
import { environment } from '../../../environments/environment';
import { LocalePathPipe } from '../../core/i18n/locale-path.pipe';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [Header, Footer, CommonModule, TranslateModule, RouterLink, BlogInvite, RevealOnScrollDirective, LocalePathPipe],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience implements OnInit, OnDestroy {
  /** Sizzle reel served from the headless WordPress host (root domain is the
   * static site now and has no /wp-content). */
  readonly videoSrc = `${environment.wpBaseUrl.replace(/\/+$/, '')}/wp-content/uploads/2026/07/Sizzle-Reel-Diocletians-Dream.mp4`;

  private static readonly JSON_LD_IDS = ['ld-experience-faq', 'ld-experience-video'];

  constructor(
    private translate: TranslateService,
    private pageSeo: PageSeoService,
    private seo: SeoService,
    private i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.pageSeo.applyLocalized('experiencePage', '/experience');

    const lang = this.i18n.current();
    const [faqSchema, videoSchema] = this.buildSchemas(
      this.translate.instant('experiencePage.seo.metaDescription'),
      lang,
    );
    // Injected into <head> via SeoService, NOT via a <script> in the template:
    // Angular's compiler strips <script> from templates, so a template tag
    // silently emits nothing at all.
    this.seo.setJsonLd('ld-experience-faq', faqSchema);
    this.seo.setJsonLd('ld-experience-video', videoSchema);
  }

  ngOnDestroy(): void {
    // <script> tags survive client-side navigation — drop them on the way out.
    for (const id of Experience.JSON_LD_IDS) this.seo.clearJsonLd(id);
  }

  private buildSchemas(metaDescription: string, lang: string): [unknown, unknown] {
    // Pull localized FAQ items from i18n.
    // Your HTML uses: ('experiencePage.faq.items' | translate)
    // This assumes items are an array of { q: string, a: string, linkText?: string }
    const faqItems = this.translate.instant('experiencePage.faq.items') as Array<{
      q: string;
      a: string;
      linkText?: string;
    }>;

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: Array.isArray(faqItems)
        ? faqItems
            .filter((x) => !!x?.q && !!x?.a)
            .map((x) => ({
              '@type': 'Question',
              name: x.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: x.a,
              },
            }))
        : [],
    };

    const trailerName =
      this.translate.instant('experiencePage.trailer.title') || 'Experience trailer';

    const trailerText =
      this.translate.instant('experiencePage.trailer.text') || metaDescription;

    const videoSchema = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: trailerName,
      description: trailerText,
      inLanguage: lang === 'hr' ? 'hr' : 'en',
      thumbnailUrl: this.pageSeo.absolute(OG_DEFAULT_IMAGE),
      // Date the sizzle reel was published to WordPress (from its upload path).
      uploadDate: '2026-07-01',
      contentUrl: this.videoSrc,
      publisher: {
        '@type': 'Organization',
        name: 'Diocletians Dream',
        url: environment.siteUrl,
      },
    };

    return [faqSchema, videoSchema];
  }
}
