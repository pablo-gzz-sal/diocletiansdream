import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { SeoService } from '../../shared/services/seo-service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule, Header, Footer],
  templateUrl: './not-found.html',
})
export class NotFound implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.setTitle('Page not found | Diocletians Dream');
    this.seo.setRobots(true); // always noindex
    // Tell the SSR server to return a real 404 for this render.
    this.seo.setHttpStatus(404);
  }
}
