import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageSeoService } from '../../shared/services/page-seo';
import { SeoService } from '../../shared/services/seo-service';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';
import { LocalePathPipe } from '../../core/i18n/locale-path.pipe';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, TranslateModule, RevealOnScrollDirective, LocalePathPipe],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit, OnDestroy {
  submitting = false;
  submitted = false;

  mapEmbedSafeUrl!: SafeResourceUrl;
  directionsUrl = '';

  private static readonly JSON_LD_ID = 'ld-visit-faq';

  constructor(
    private sanitizer: DomSanitizer,
    private pageSeo: PageSeoService,
    private seo: SeoService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    // ✅ Keep your map: paste your existing embed URL here (the SAME one from your current contact page)
    const mapEmbedUrl = 'PASTE_YOUR_EXISTING_GOOGLE_MAPS_EMBED_URL_HERE';
    this.mapEmbedSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapEmbedUrl);

    // Directions link (replace with your real place link or query)
    this.directionsUrl = 'https://www.google.com/maps?q=Diocletian%27s%20Dream%20Split';

    this.pageSeo.applyLocalized('visitPage', '/visit');

    // Injected into <head> via SeoService, NOT via a <script> in the template:
    // Angular's compiler strips <script> from templates, so a template tag
    // silently emits nothing at all.
    this.seo.setJsonLd(Contact.JSON_LD_ID, this.buildFaqSchema());
  }

  ngOnDestroy(): void {
    // <script> tags survive client-side navigation — drop it on the way out.
    this.seo.clearJsonLd(Contact.JSON_LD_ID);
  }

  /** FAQPage built from the localized visitPage.faq.items the template renders. */
  private buildFaqSchema(): unknown {
    const items = this.translate.instant('visitPage.faq.items') as Array<{
      q: string;
      a: string;
    }>;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: Array.isArray(items)
        ? items
            .filter((x) => !!x?.q && !!x?.a)
            .map((x) => ({
              '@type': 'Question',
              name: x.q,
              acceptedAnswer: { '@type': 'Answer', text: x.a },
            }))
        : [],
    };
  }


  onSubmit() {
    this.submitting = true;
    // Wire up to your backend / EmailJS / Formspree here
    setTimeout(() => {
      this.submitting = false;
      this.submitted = true;
    }, 1200);
  }

  onNewsletterSubmit() {
    // Wire up to your newsletter provider here
  }
}
