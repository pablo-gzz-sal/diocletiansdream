import { NgClass } from '@angular/common';
import { AfterViewInit, Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from '../../i18n/i18n.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy, AfterViewInit {
  private lastY = 0;
  menuOpen = signal(false);
  scrolled = signal(false);
  hidden = signal(false);
  private i18n = inject(I18nService);

  private removeOverflow = () => document.body.classList.remove('overflow-hidden');

  constructor(private router: Router) {}


  ngOnInit() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.closeMenu());
  }

    private isMobileOrTablet(): boolean {
    return window.matchMedia('(max-width: 1023px)').matches;
  }


  ngAfterViewInit() {
    this.lastY = window.scrollY || 0;
    this.scrolled.set(this.lastY > 8);
    this.hidden.set(false);
  }

@HostListener('window:scroll')
  onScroll() {
    const y = window.scrollY || 0;
    this.scrolled.set(y > 8);

    if (!this.isMobileOrTablet()) {
      this.hidden.set(false);
      this.lastY = y;
      return;
    }

    if (y < 24) {
      this.hidden.set(false);
      this.lastY = y;
      return;
    }

    const delta = y - this.lastY;

    if (Math.abs(delta) < 6) return;
    this.hidden.set(delta > 0 && y > 120);

    this.lastY = y;
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isMobileOrTablet()) this.hidden.set(false);
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
    document.body.classList.toggle('overflow-hidden', this.menuOpen());
  }

  closeMenu() {
    this.menuOpen.set(false);
    this.removeOverflow();
  }

  ngOnDestroy() {
    this.removeOverflow();
  }

  toggleLang() {
    this.i18n.toggle();
  }

  currentLang() {
    return this.i18n.current();
  }
}
