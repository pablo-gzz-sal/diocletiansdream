import { NgClass } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
export class Header implements OnInit, OnDestroy {
  menuOpen = signal(false);
  scrolled = signal(false);
  private i18n = inject(I18nService);

  private removeOverflow = () => document.body.classList.remove('overflow-hidden');

  constructor(private router: Router) {}

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 32);
  }

  ngOnInit() {
    // Close menu on route change
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.closeMenu());
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
    console.log(this.i18n.current());

    return this.i18n.current();
  }
}
