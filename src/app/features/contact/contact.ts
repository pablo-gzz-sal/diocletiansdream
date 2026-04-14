import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SeoService } from '../../shared/services/seo-service';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, TranslateModule, RevealOnScrollDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit, OnDestroy {
  submitting = false;
  submitted = false;

  schemaJsonLd = '';
  mapEmbedSafeUrl!: SafeResourceUrl;
  directionsUrl = '';

  private sub?: Subscription;

  constructor(
    private title: Title,
    private meta: Meta,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
    private seo: SeoService,
  ) {
    this.title.setTitle("Contact — Diocletian's Dream VR Museum | Split");
    this.meta.updateTag({
      name: 'description',
      content:
        "Get in touch with Diocletian's Dream. Find our address in Split's Old Town, opening hours, ticket prices, and contact details.",
    });
  }

  ngOnInit(): void {
    window.scroll(0, 0);

    // ✅ Keep your map: paste your existing embed URL here (the SAME one from your current contact page)
    const mapEmbedUrl = 'PASTE_YOUR_EXISTING_GOOGLE_MAPS_EMBED_URL_HERE';
    this.mapEmbedSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapEmbedUrl);

    // Directions link (replace with your real place link or query)
    this.directionsUrl = 'https://www.google.com/maps?q=Diocletian%27s%20Dream%20Split';

    this.applySeo(this.translate.currentLang || 'en');
    this.sub = this.translate.onLangChange.subscribe((e) => this.applySeo(e.lang));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private applySeo(lang: string) {
    // META TITLE (exactly your notes)
    const metaTitle =
      lang === 'hr'
        ? "Posjetite Diocletian's Dream u Splitu | Ulaznice i grupni posjeti"
        : "Visit Diocletian's Dream in Split | Tickets & Group Visits";

    // META DESCRIPTION (exactly your notes)
    const metaDescription =
      lang === 'hr'
        ? "Planirajte posjet Diocletian's Dream u Splitu. Rezervirajte VR iskustvo ili pošaljite upit za grupne i školske posjete. Preporučuje se rezervacija unaprijed."
        : 'Plan your visit to Diocletian\'s Dream in Split. Book your VR experience or contact us for group and school visit arrangements. Advance booking recommended.';

    this.title.setTitle(metaTitle);
    this.seo.setCanonical('https://diocletiansdream.com/visit');

    this.meta.updateTag({ name: 'description', content: metaDescription });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: metaTitle });
    this.meta.updateTag({ property: 'og:description', content: metaDescription });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://diocletiansdream.com/visit' });

    // Twitter
    this.meta.updateTag({ name: 'twitter:title', content: metaTitle });
    this.meta.updateTag({ name: 'twitter:description', content: metaDescription });

    // Optional JSON-LD later if you want (LocalBusiness already on About per Pablo note)
    // this.schemaJsonLd = JSON.stringify({...});
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
