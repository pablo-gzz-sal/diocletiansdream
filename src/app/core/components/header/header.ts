import { DOCUMENT, isPlatformBrowser, NgClass } from '@angular/common';
import { AfterViewInit, Component, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from '../../i18n/i18n.service';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_LANG, SupportedLang } from '../../i18n/i18n.config';
import { hasCounterpart, stripLocale, withLocale } from '../../i18n/locale-url';
import { LocalePathPipe } from '../../i18n/locale-path.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, TranslateModule, LocalePathPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy, AfterViewInit {
  menuOpen = signal(false);
  scrolled = signal(false);
  homeRoute = signal(false);

  private i18n = inject(I18nService);
  private doc = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private removeOverflow = () => this.doc.body.classList.remove('overflow-hidden');

  constructor(private router: Router) {}

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
    this.scrolled.set((window.scrollY || 0) > 8);
  }

  @HostListener('window:scroll')
  onScroll() {
    const y = window.scrollY || 0;
    this.scrolled.set(y > 8);
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
  }

  /**
   * Switching language is a navigation, not an in-memory flip: the URL is the
   * source of truth for language. Pages that exist only in English (the blog,
   * a post) have no Croatian counterpart, so switching to Croatian from one
   * lands on the Croatian home page instead.
   */
  switchTo(target: SupportedLang) {
    if (target === this.currentLang()) return;
    const { path } = stripLocale(this.router.url);
    const dest = hasCounterpart(path)
      ? withLocale(path, target)
      : target === DEFAULT_LANG
        ? path
        : withLocale('/', target);
    this.router.navigateByUrl(dest);
  }

  currentLang() {
    return this.i18n.current();
  }

  private updateRouteState() {
    // Compare the locale-stripped path so /hr/ counts as home too.
    const { path } = stripLocale(this.router.url);
    this.homeRoute.set(path === '/');
  }
}
