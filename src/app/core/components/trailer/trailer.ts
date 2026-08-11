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

  /** Skip the opening logo and reset before the closing branding begins. */
  readonly loopStartSeconds = 5;
  readonly loopEndSeconds = 47.2;
  readonly heroCopyVisibleForSeconds = 5;
  readonly heroCopyReturnForSeconds = 4;

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

  /** Keeps the opening and closing beats readable while the middle stays cinematic. */
  heroCopyVisible = true;

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private loopSeekInProgress = false;
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

  onVideoLoadedMetadata(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    video.currentTime = this.loopStartSeconds;
    this.updateHeroCopyVisibility(this.loopStartSeconds);
  }

  onVideoTimeUpdate(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    this.updateHeroCopyVisibility(video.currentTime);

    if (this.loopSeekInProgress || video.currentTime < this.loopEndSeconds) return;

    this.loopSeekInProgress = true;
    video.currentTime = this.loopStartSeconds;
    this.updateHeroCopyVisibility(this.loopStartSeconds);

    const playback = video.play();
    if (playback && typeof playback.catch === 'function') playback.catch(() => {});
  }

  onVideoSeeked(): void {
    this.loopSeekInProgress = false;
  }

  private updateHeroCopyVisibility(currentTime: number): void {
    const elapsedLoopTime = currentTime - this.loopStartSeconds;
    this.heroCopyVisible =
      elapsedLoopTime <= this.heroCopyVisibleForSeconds ||
      currentTime >= this.loopEndSeconds - this.heroCopyReturnForSeconds;
  }

  private prefersReducedMotion(): boolean {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
