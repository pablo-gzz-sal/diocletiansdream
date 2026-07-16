import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslateLoader } from '../app/core/i18n/json-translate.loader';

/**
 * Shared TestBed wiring for component specs.
 *
 * Nearly every component reaches TranslateService (via `| translate`, the
 * locPath pipe, or the Header/Footer it embeds), and TranslateService needs
 * HttpClient to load the language JSON. Router providers cover routerLink.
 */
export const commonTestImports = [
  TranslateModule.forRoot({
    fallbackLang: 'en',
    loader: {
      provide: TranslateLoader,
      useFactory: (http: HttpClient) => new JsonTranslateLoader(http),
      deps: [HttpClient],
    },
  }),
];

export const commonTestProviders: Array<Provider | EnvironmentProviders> = [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([]),
];
