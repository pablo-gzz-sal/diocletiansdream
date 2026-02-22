import { NgClass } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService, Lang } from '../../i18n/i18n-service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  menuOpen = signal(false);
  scrolled = signal(false);

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
}
