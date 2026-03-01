import { Component, OnDestroy, OnInit } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [Header, Footer, CommonModule, TranslateModule, RouterLink],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience implements OnInit, OnDestroy {
  schemaJsonLd = '';
  private sub?: Subscription;

  constructor(
    private title: Title,
    private meta: Meta,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);

    // Apply SEO on initial load
    this.applySeo(this.translate.currentLang || 'en');

    // Re-apply SEO + schema whenever language changes
    this.sub = this.translate.onLangChange.subscribe((e) => {
      this.applySeo(e.lang);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private applySeo(lang: string) {
    // META TITLE (exactly from your notes)
    const metaTitle =
      lang === 'hr'
        ? 'VR iskustvo Dioklecijanove palače u Splitu | Diocletian’s Dream'
        : 'Diocletian’s Palace Virtual Reality in Split | Diocletian’s Dream';

    // META DESCRIPTION (exactly from your notes)
    const metaDescription =
      lang === 'hr'
        ? 'Doživite Dioklecijanovu palaču onako kako je izgledala 305. godine kroz 15-minutno VR putovanje u Splitu. Suvremena interpretacija rimske povijesti. Rezervirajte posjet.'
        : 'Explore Diocletian’s Palace as it stood in 305 AD through a 15-minute virtual reality journey in Split. A visually reconstructed chapter of Roman history. Book your session.';

    this.title.setTitle(metaTitle);

    this.meta.updateTag({ name: 'description', content: metaDescription });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: metaTitle });
    this.meta.updateTag({ property: 'og:description', content: metaDescription });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://diocletiansdream.com/experience' });

    // Twitter
    this.meta.updateTag({ name: 'twitter:title', content: metaTitle });
    this.meta.updateTag({ name: 'twitter:description', content: metaDescription });

    // JSON-LD (FAQPage + VideoObject)
    this.schemaJsonLd = this.buildSchemaJsonLd(metaTitle, metaDescription, lang);
  }

  private buildSchemaJsonLd(metaTitle: string, metaDescription: string, lang: string): string {
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

    // Trailer / VideoObject:
    // If you later have a real URL, just swap these placeholders.
    // Keep it language-aware.
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
      // Replace these when you have real assets:
      thumbnailUrl: 'https://diocletiansdream.com/assets/images/experience-trailer-thumb.jpg',
      uploadDate: '2020-01-01',
      embedUrl: 'https://www.youtube.com/embed/REPLACE_WITH_VIDEO_ID',
      contentUrl: 'https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID',
      publisher: {
        '@type': 'Organization',
        name: "Diocletian's Dream",
        url: 'https://diocletiansdream.com/',
      },
    };

    // You can output multiple JSON-LD blocks as an array:
    return JSON.stringify([faqSchema, videoSchema]);
  }
}
