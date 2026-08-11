import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocalePathPipe } from '../../i18n/locale-path.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-trailer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LocalePathPipe],
  templateUrl: './trailer.html',
  styleUrl: './trailer.css',
})
export class Trailer {
  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;

  /**
   * Served from the headless WordPress host (CMS subdomain) over https to avoid
   * mixed-content blocking. The root domain is the static Angular site now and
   * has no /wp-content, so the file must be fetched from wpBaseUrl.
   */
  readonly src = `${environment.wpBaseUrl.replace(/\/+$/, '')}/wp-content/uploads/2026/07/Sizzle-Reel-Diocletians-Dream.mp4`;
  readonly poster = 'assets/images/vr/emperor-peristyle.jpg';

  /** Tracks transient media playback for the current video state. */
  playing = false;

  /** Remains true after a pause so the viewer never loses access to playback controls. */
  hasStarted = false;

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly autoplayAllowed = this.isBrowser && !this.prefersReducedMotion();

  play(): void {
    if (this.playing || !this.isBrowser) return;

    const v = this.videoRef?.nativeElement;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  onVideoPlay(): void {
    this.hasStarted = true;
    this.playing = true;
  }

  onVideoPause(): void {
    this.playing = false;
  }
  private prefersReducedMotion(): boolean {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
