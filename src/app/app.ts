import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieBanner } from './core/components/cookie-banner/cookie-banner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookieBanner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('diocletiansdream');
  // Language is set by languageResolver from the route, not here: App is
  // constructed before route resolution, so initialising i18n at this point
  // would apply the wrong language and fight the resolver.
}
