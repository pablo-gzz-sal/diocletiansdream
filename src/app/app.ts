import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieBanner } from './core/components/cookie-banner/cookie-banner';
import { InteractionTrackingService } from './shared/services/interaction-tracking.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookieBanner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('diocletiansdream');
  private readonly interactionTracking = inject(InteractionTrackingService);

  @HostListener('click', ['$event'])
  protected trackInteraction(event: Event): void {
    this.interactionTracking.handleClick(event);
  }

  // Language is set by languageResolver from the route, not here: App is
  // constructed before route resolution, so initialising i18n at this point
  // would apply the wrong language and fight the resolver.
}
