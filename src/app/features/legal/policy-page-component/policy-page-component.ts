import { Component, Input, OnInit, inject } from '@angular/core';
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
})
export class PolicyPageComponent implements OnInit {
  @Input({ required: true }) title!: string;
  /**
   * This page's own path, e.g. '/privacy'. Required: without it the page keeps
   * index.html's canonical, which points at the homepage and makes Google treat
   * every legal page as a duplicate of it.
   */
  @Input({ required: true }) path!: string;
  @Input() updatedAt?: string;

  private seo = inject(SeoService);

  ngOnInit() {
    const url = `${environment.siteUrl.replace(/\/+$/, '')}${this.path}`;
    this.seo.setTitle(`${this.title} | Diocletians Dream`);
    this.seo.setRobots();
    this.seo.setCanonical(url);
    this.seo.setOpenGraph({ title: this.title, url, type: 'website' });
    // English-only: these are untranslated legal documents.
    this.seo.clearAlternates();
  }
}
