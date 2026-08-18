import { Component, Input, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Header } from '../../../core/components/header/header';
import { Footer } from '../../../core/components/footer/footer';
import { SeoService } from '../../../shared/services/seo-service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-policy-page-component',
  standalone: true,
  imports: [Header, Footer],
  templateUrl: './policy-page-component.html',
  styleUrl: './policy-page-component.css',
  encapsulation: ViewEncapsulation.None,
})
export class PolicyPageComponent implements OnInit, OnDestroy {
  @Input({ required: true }) title!: string;
  /**
   * This page's own path, e.g. '/privacy'. Required: without it the page keeps
   * index.html's canonical, which points at the homepage and makes Google treat
   * every legal page as a duplicate of it.
   */
  @Input({ required: true }) path!: string;
  /**
   * Required for the same reason as `path`: without it the page keeps
   * index.html's description, so all three policies shipped the homepage's
   * sales copy as their search snippet.
   */
  @Input({ required: true }) description!: string;
  @Input() updatedAt?: string;

  private seo = inject(SeoService);

  ngOnInit() {
    const base = environment.siteUrl.replace(/\/+$/, '');
    const url = `${base}${this.path}`;
    const title = `${this.title} | Diocletian's Dream`;

    this.seo.setTitle(title);
    this.seo.setDescription(this.description);
    this.seo.setRobots();
    this.seo.setCanonical(url);
    this.seo.setOpenGraph({
      title,
      description: this.description,
      url,
      image: `${base}/assets/images/og-default.jpg`,
      type: 'website',
      locale: 'en_US',
    });
    // English-only: these are untranslated legal documents.
    this.seo.clearAlternates();

    this.seo.setJsonLd('ld-policy', {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}/#webpage`,
      url: `${url}/`,
      name: this.title,
      description: this.description,
      inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', '@id': `${base}/#website`, url: `${base}/`, name: "Diocletian's Dream" },
      publisher: { '@type': 'Organization', '@id': `${base}/#organization`, name: "Diocletian's Dream", url: `${base}/` },
      ...(this.updatedAt ? { dateModified: this.updatedAt } : {}),
    });
  }

  ngOnDestroy() {
    this.seo.clearJsonLd('ld-policy');
  }
}
