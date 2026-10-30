import { ApplicationConfig, DOCUMENT, PLATFORM_ID, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import {  TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslateLoader } from './core/i18n/json-translate.loader';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { trailingSlashUrlSerializerProvider } from './core/trailing-slash-url-serializer';
import { I18nService } from './core/i18n/i18n.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new JsonTranslateLoader(http, isThankYouPath(inject(DOCUMENT).location.pathname));
}

function isThankYouPath(path: string): boolean {
  return path.startsWith('/dd-thankyou');
}

/**
 * Translations no longer ship inside the page, so hold hydration until they have
 * loaded. The prerendered page is already on screen, and `| translate` never
 * shows raw keys.
 */
function loadTranslationsBeforeHydration(): Promise<unknown> | void {
  const path = inject(DOCUMENT).location.pathname;
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || isThankYouPath(path)) return;

  const lang = path === '/hr' || path.startsWith('/hr/') ? 'hr' : 'en';
  return firstValueFrom(inject(I18nService).activate(lang)).catch(() => undefined);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    trailingSlashUrlSerializerProvider,
    // withFetch() is REQUIRED for prerendering: the prerenderer serves
    // /assets/** from an in-memory map by patching globalThis.fetch. Without
    // it HttpClient uses xhr2, which bypasses that patch and tries a real
    // connection to the synthetic host, so JsonTranslateLoader's request for
    // /assets/i18n/<lang>.json fails and every translation renders empty.
    provideHttpClient(withFetch()),
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ), provideClientHydration(withEventReplay()),
    provideAppInitializer(loadTranslationsBeforeHydration),
  ]
};
