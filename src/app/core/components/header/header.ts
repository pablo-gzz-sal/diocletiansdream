import { DOCUMENT, isPlatformBrowser, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from '../../i18n/i18n.service';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_LANG, SupportedLang } from '../../i18n/i18n.config';
import { hasCounterpart, stripLocale, withLocale } from '../../i18n/locale-url';
import { LocalePathPipe } from '../../i18n/locale-path.pipe';
import { PostLanguageRouteService } from '../../i18n/post-language-route.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, TranslateModule, LocalePathPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy, AfterViewInit {
  private static readonly HOME_HEADER_REVEAL_OFFSET = 200;

  menuOpen = signal(false);
  scrolled = signal(false);
  homeRoute = signal(false);

  private i18n = inject(I18nService);
  private doc = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private scrollFrame: number | null = null;
  private removeScrollListener = () => {};
  private removeOverflow = () => this.doc.body.classList.remove('overflow-hidden');

  constructor(
    private router: Router,
    private postLanguageRoutes: PostLanguageRouteService,
  ) {}

  ngOnInit() {
    this.updateRouteState();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.closeMenu());

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.updateRouteState());
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    this.updateScrollState();

    this.zone.runOutsideAngular(() => {
      const handleScroll = () => {
        if (this.scrollFrame !== null) return;

        this.scrollFrame = window.requestAnimationFrame(() => {
          this.scrollFrame = null;
          this.zone.run(() => this.updateScrollState());
        });
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      this.removeScrollListener = () => window.removeEventListener('scroll', handleScroll);
    });
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
    this.doc.body.classList.toggle('overflow-hidden', this.menuOpen());
  }

  closeMenu() {
    this.menuOpen.set(false);
    this.removeOverflow();
  }

  ngOnDestroy() {
    this.removeOverflow();
    this.removeScrollListener();

    if (this.scrollFrame !== null) {
      window.cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = null;
    }
  }

  /**
   * Switching language is a navigation, not an in-memory flip: the URL is the
   * source of truth for language. Pages with a counterpart (marketing pages and
   * the blog index) map across locales; pages without one — a legal page or an
   * individual post, whose en/hr slugs differ and aren't known here — fall back
   * to the target locale's home page instead.
   */
  switchTo(target: SupportedLang) {
    if (target === this.currentLang()) return;
    const { path } = stripLocale(this.router.url);
    const dest = this.postLanguageRoutes.destinationFor(this.router.url, target) ??
      (hasCounterpart(path)
        ? withLocale(path, target)
        : target === DEFAULT_LANG
          ? path
          : withLocale('/', target));
    this.router.navigateByUrl(dest);
  }

  currentLang() {
    return this.i18n.current();
  }

  private updateRouteState() {
    // Compare the locale-stripped path so /hr/ counts as home too.
    const { path } = stripLocale(this.router.url);
    this.homeRoute.set(path === '/');
    if (this.isBrowser) this.updateScrollState();
  }

  private updateScrollState() {
    const offset = this.homeRoute() ? Header.HOME_HEADER_REVEAL_OFFSET : 8;
    const nextScrolled = (window.scrollY || 0) > offset;

    if (this.scrolled() !== nextScrolled) {
      this.scrolled.set(nextScrolled);
    }
  }
}
