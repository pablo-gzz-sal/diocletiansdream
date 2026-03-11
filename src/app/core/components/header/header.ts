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
  menuOpen = signal(false);
  scrolled = signal(false);

  private i18n = inject(I18nService);
  private removeOverflow = () => document.body.classList.remove('overflow-hidden');

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.closeMenu());
  }

  ngAfterViewInit() {
    this.scrolled.set((window.scrollY || 0) > 8);
  }

  @HostListener('window:scroll')
  onScroll() {
    const y = window.scrollY || 0;
    this.scrolled.set(y > 8);
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
