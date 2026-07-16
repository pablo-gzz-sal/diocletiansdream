import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import {  TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslateLoader } from './core/i18n/json-translate.loader';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { trailingSlashUrlSerializerProvider } from './core/trailing-slash-url-serializer';

export function HttpLoaderFactory(http: HttpClient) {
  return new JsonTranslateLoader(http);
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
  ]
};
