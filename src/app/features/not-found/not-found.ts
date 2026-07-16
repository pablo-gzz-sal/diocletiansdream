import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { SeoService } from '../../shared/services/seo-service';
import { LocalePathPipe } from '../../core/i18n/locale-path.pipe';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule, Header, Footer, LocalePathPipe],
  templateUrl: './not-found.html',
})
export class NotFound implements OnInit {
  constructor(
    private seo: SeoService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.seo.setTitle(this.translate.instant('pageNotFound.seo.metaTitle'));
    this.seo.setRobots(true); // always noindex
    this.seo.clearAlternates();
    // Tell the SSR server to return a real 404 for this render.
    this.seo.setHttpStatus(404);
  }
}
