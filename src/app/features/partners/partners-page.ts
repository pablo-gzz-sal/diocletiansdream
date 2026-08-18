import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { Partners } from '../../core/components/partners/partners';
import { OG_DEFAULT_IMAGE, PageSeoService } from '../../shared/services/page-seo';
import { SeoService } from '../../shared/services/seo-service';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';
import { LocalePathPipe } from '../../core/i18n/locale-path.pipe';
import { StructuredDataService } from '../../shared/services/structured-data';

/**
 * Recommended local experiences, previously a homepage section. Moved to its
 * own page so the homepage keeps a single conversion path: every card here
 * links OFF-site, which is exactly what you don't want competing with the
 * booking CTA above the fold.
 *
 * The card content still lives in `core/components/partners` under the
 * `home.partners.*` i18n keys — the keys keep their names so the translations
 * (and the Croatian copy) stay put rather than being renamed in two locales
 * for no functional gain.
 */
@Component({
  selector: 'app-partners-page',
  standalone: true,
  imports: [
    RouterLink,
    Header,
    Footer,
    Partners,
    TranslateModule,
    RevealOnScrollDirective,
    LocalePathPipe,
  ],
  templateUrl: './partners-page.html',
  styleUrl: './partners-page.css',
})
export class PartnersPage implements OnInit, OnDestroy {
  private static readonly JSON_LD_ID = 'ld-partners';

  constructor(
    private pageSeo: PageSeoService,
    private seo: SeoService,
    private translate: TranslateService,
    private sd: StructuredDataService,
  ) {}

  ngOnInit(): void {
    this.pageSeo.applyLocalized('partnersPage', '/partners');

    // Injected into <head> via SeoService, NOT via a <script> in the template:
    // Angular's compiler strips <script> from templates, so a template tag
    // silently emits nothing at all.
    this.seo.setJsonLd(PartnersPage.JSON_LD_ID, this.buildGraph());
  }

  ngOnDestroy(): void {
    // <script> tags survive client-side navigation — drop it on the way out.
    this.seo.clearJsonLd(PartnersPage.JSON_LD_ID);
  }

  private buildGraph(): unknown {
    const url = this.sd.url('/partners');
    const title = this.translate.instant('partnersPage.seo.metaTitle') as string;
    const description = this.translate.instant('partnersPage.seo.metaDescription') as string;

    return this.sd.graph([
      this.sd.organization(),
      this.sd.website(),
      this.sd.webPage({
        type: 'CollectionPage',
        url,
        name: title,
        description,
        primaryImage: this.sd.asset(OG_DEFAULT_IMAGE),
        breadcrumbId: `${url}#breadcrumb`,
      }),
      this.sd.breadcrumb(url, [
        this.sd.homeCrumb(),
        { name: this.translate.instant('footer.company.partners'), url },
      ]),
    ]);
  }
}
