import { NgClass } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService, Lang } from '../../i18n/i18n-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  scrolled = signal(false);
  menuOpen = signal(false);

  constructor(private i18n: I18nService) {}

  @HostListener('window:scroll')

  get lang(): Lang {
    return this.i18n.current();
  }
  onScroll() {
    this.scrolled.set(window.scrollY > 8);
  }

  toggleLang() {
    this.i18n.use(this.lang === 'en' ? 'hr' : 'en');
  }
  toggleMenu() {
  this.menuOpen.update(v => !v);
  document.body.classList.toggle('overflow-hidden', this.menuOpen());
}

closeMenu() {
  this.menuOpen.set(false);
  document.body.classList.remove('overflow-hidden');
}
}
