import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { SeoService } from '../../shared/services/seo-service';

/**
 * Booking confirmation page (/dd-thankyou/). TuriTop redirects here after a
 * completed booking, so this page is where conversion tracking fires.
 *
 * Always noindex,nofollow: it must never appear in search results, and it is
 * excluded from sitemap.xml (see scripts/generate-sitemap.mjs).
 */
@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [RouterLink, Header, Footer],
  templateUrl: './thank-you.html',
})
export class ThankYou implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.setTitle('Booking confirmed | Diocletians Dream');
    this.seo.setDescription('Your Diocletians Dream VR booking is confirmed.');
    this.seo.setRobots(true); // always noindex, nofollow
  }
}
