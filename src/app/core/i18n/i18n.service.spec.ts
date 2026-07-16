import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { I18nService } from './i18n.service';
import { JsonTranslateLoader } from './json-translate.loader';
import { HttpClient } from '@angular/common/http';

describe('I18nService', () => {
  let service: I18nService;
  let http: HttpTestingController;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          fallbackLang: 'en',
          loader: {
            provide: TranslateLoader,
            useFactory: (h: HttpClient) => new JsonTranslateLoader(h),
            deps: [HttpClient],
          },
        }),
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(I18nService);
    http = TestBed.inject(HttpTestingController);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    // TranslateModule eagerly loads the fallback language; drain it so verify()
    // only reports requests the test actually cares about.
    http.match('/assets/i18n/en.json').forEach((r) => !r.cancelled && r.flush({}));
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('emits only once the language JSON has loaded', () => {
    let emitted: string | undefined;
    service.activate('hr').subscribe((lang) => (emitted = lang));

    // Nothing yet: this is what makes the router block route activation, and
    // is why prerendered pages contain real text instead of empty tags.
    expect(emitted).toBeUndefined();

    http.expectOne('/assets/i18n/hr.json').flush({ home: { seo: { metaTitle: 'Naslov' } } });

    expect(emitted).toBe('hr');
  });

  it('sets documentElement.lang so the prerendered file ships <html lang="hr">', () => {
    service.activate('hr').subscribe();
    expect(doc.documentElement.lang).toBe('hr');

    http.expectOne('/assets/i18n/hr.json').flush({});
  });

  it('reports the active language', () => {
    service.activate('hr').subscribe();
    http.expectOne('/assets/i18n/hr.json').flush({});

    expect(service.current()).toBe('hr');
  });
});
