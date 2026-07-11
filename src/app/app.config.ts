import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient } from '@angular/common/http';
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
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        useDefaultLang: true,
      }),
    ), provideClientHydration(withEventReplay()),
  ]
};
