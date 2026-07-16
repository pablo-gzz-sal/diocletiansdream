import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';
import { withLocale } from './locale-url';

/**
 * Prefixes an internal link with the current locale: on /hr/ pages
 * `'/booking' | locPath` yields '/hr/booking'. Without this, links on Croatian
 * pages navigate back into the English tree and the Croatian pages become an
 * orphaned island with no internal Croatian links.
 *
 * Do NOT use for permanently English destinations (/blog, blog post slugs, the
 * legal pages) — leaving those unpiped is the intended escape hatch.
 *
 * Pure on purpose: LandingPage runs a mousemove listener inside the Angular
 * zone, so an impure pipe would re-run for every link on every pointer move.
 * Pure is also correct — a locale change always crosses a different route
 * config, which destroys and recreates the component tree.
 */
@Pipe({ name: 'locPath', standalone: true })
export class LocalePathPipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(path: string): string {
    return withLocale(path, this.i18n.current());
  }
}
