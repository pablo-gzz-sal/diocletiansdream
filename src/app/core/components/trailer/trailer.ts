import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import Player from '@vimeo/player';
import { LocalePathPipe } from '../../i18n/locale-path.pipe';

@Component({
  selector: 'app-trailer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LocalePathPipe],
  templateUrl: './trailer.html',
  styleUrl: './trailer.css',
})
export class Trailer implements OnDestroy {
  @ViewChild('playerFrame') playerFrameRef?: ElementRef<HTMLIFrameElement>;

  /** Skip the opening logo and reset before the closing branding begins. */
  readonly loopStartSeconds = 5;
  readonly loopEndSeconds = 47.2;
  readonly heroCopyVisibleForSeconds = 5;
  readonly heroCopyReturnForSeconds = 4;

  /** Tracks transient media playback for the current video state. */
  playing = false;

  /** Remains true after a pause so the viewer never loses access to playback controls. */
  hasStarted = false;

  /** Keeps the opening and closing beats readable while the middle stays cinematic. */
  heroCopyVisible = true;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sanitizer = inject(DomSanitizer);
  private loopSeekInProgress = false;
  readonly autoplayAllowed = this.isBrowser && !this.prefersReducedMotion();
  readonly playerUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.createPlayerUrl());

  private player?: Player;

  play(): void {
    if (this.playing || !this.isBrowser) return;

    void this.player?.play().catch(() => {});
  }

  onPlayerFrameLoad(): void {
    const frame = this.playerFrameRef?.nativeElement;
    if (!this.isBrowser || !frame || this.player) return;

    this.player = new Player(frame);
    this.player.on('play', () => this.onPlayerPlay());
    this.player.on('pause', () => this.onPlayerPause());
    this.player.on('timeupdate', ({ seconds }) => this.onPlayerTimeUpdate(seconds));
    this.player.on('seeked', () => this.onPlayerSeeked());
    void this.player.ready().then(() => this.onPlayerReady()).catch(() => {});
  }

  onPlayerPlay(): void {
    this.hasStarted = true;
    this.playing = true;
  }

  onPlayerPause(): void {
    this.playing = false;
  }

  onPlayerReady(): Promise<void> {
    const player = this.player;
    if (!player) return Promise.resolve();

    this.updateHeroCopyVisibility(this.loopStartSeconds);
    const seek = player.setCurrentTime(this.loopStartSeconds).then(() => {}).catch(() => {});
    const mute = player.setMuted(true).then(() => {}).catch(() => {});
    const autoplay = this.autoplayAllowed ? player.play().then(() => {}).catch(() => {}) : Promise.resolve();

    return Promise.all([seek, mute, autoplay]).then(() => {});
  }

  onPlayerTimeUpdate(currentTime: number): void {
    this.updateHeroCopyVisibility(currentTime);

    if (this.loopSeekInProgress || currentTime < this.loopEndSeconds) return;

    this.loopSeekInProgress = true;
    this.updateHeroCopyVisibility(this.loopStartSeconds);

    const player = this.player;
    if (!player) {
      this.loopSeekInProgress = false;
      return;
    }

    void player
      .setCurrentTime(this.loopStartSeconds)
      .then(() => player.play())
      .catch(() => {})
      .finally(() => {
        this.loopSeekInProgress = false;
      });
  }

  onPlayerSeeked(): void {
    this.loopSeekInProgress = false;
  }

  ngOnDestroy(): void {
    void this.player?.destroy().catch(() => {});
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

  private createPlayerUrl(): string {
    const parameters = new URLSearchParams({
      autoplay: this.autoplayAllowed ? '1' : '0',
      autopause: '0',
      badge: '0',
      byline: '0',
      controls: '1',
      dnt: '1',
      muted: '1',
      playsinline: '1',
      portrait: '0',
      title: '0',
    });

    return `https://player.vimeo.com/video/1217274878?${parameters.toString()}`;
  }
}
