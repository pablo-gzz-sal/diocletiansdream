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

  readonly heroCopyVisibleForSeconds = 2.5;
  readonly heroCopyReturnForSeconds = 4;
  readonly loopCrossfadeForSeconds = 0.8;

  /** Tracks transient media playback for the current video state. */
  playing = false;

  /** Remains true after a pause so the viewer never loses access to playback controls. */
  hasStarted = false;

  /** Keeps the opening and closing beats readable while the middle stays cinematic. */
  heroCopyVisible = true;

  /** Reveals the moving picture only after Vimeo has buffered behind the ancient still. */
  videoRevealed = false;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sanitizer = inject(DomSanitizer);
  private loopTransitionActive = false;
  private heroVisible = true;
  private videoDuration = 0;
  private playerPrepared = false;
  private visibilityObserver?: IntersectionObserver;
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
    this.player.on('ended', () => this.onPlayerEnded());
    this.player.on('timeupdate', ({ seconds }) => this.onPlayerTimeUpdate(seconds));
    this.observeHeroVisibility(frame);
    void this.player.ready().then(() => this.onPlayerReady()).catch(() => {});
  }

  onPlayerPlay(): void {
    this.hasStarted = true;
    this.playing = true;
    if (!this.loopTransitionActive) {
      this.videoRevealed = true;
    }
  }

  onPlayerPause(): void {
    this.playing = false;

    if (!this.heroVisible || !this.autoplayAllowed || !this.playerPrepared) {
      return;
    }

    void this.player?.play().catch(() => {});
  }

  onPlayerEnded(): void {
    this.playing = false;

    if (this.heroVisible) {
      this.loopTransitionActive = true;
      this.videoRevealed = false;
      this.heroCopyVisible = true;
      void this.player?.play().catch(() => {});
    }
  }

  async onPlayerReady(): Promise<void> {
    const player = this.player;
    if (!player) return;

    const [duration] = await Promise.all([
      player.getDuration().catch(() => 0),
      player.setMuted(true).then(() => true).catch(() => false),
    ]);
    this.videoDuration = duration;
    this.updateHeroCopyVisibility(0);
    this.playerPrepared = true;

    if (this.autoplayAllowed && this.heroVisible) {
      await this.startPreparedPlayback();
    }
  }

  onPlayerTimeUpdate(currentTime: number): void {
    const closingTransitionStart = Math.max(0, this.videoDuration - this.loopCrossfadeForSeconds);

    if (
      this.loopTransitionActive &&
      currentTime >= 0.15 &&
      (this.videoDuration <= 0 || currentTime < closingTransitionStart)
    ) {
      this.loopTransitionActive = false;
      this.videoRevealed = true;
    }

    if (this.videoDuration > 0 && currentTime >= closingTransitionStart) {
      this.loopTransitionActive = true;
      this.videoRevealed = false;
    }

    this.updateHeroCopyVisibility(currentTime);
  }

  onHeroVisibilityChange(visible: boolean): void {
    this.heroVisible = visible;

    const player = this.player;
    if (!player || !this.autoplayAllowed) return;

    if (!visible) {
      void player.pause().catch(() => {});
      return;
    }

    void player.play().catch(() => {});
  }

  ngOnDestroy(): void {
    this.visibilityObserver?.disconnect();
    void this.player?.destroy().catch(() => {});
  }

  private async startPreparedPlayback(): Promise<void> {
    const player = this.player;
    if (!player || !this.autoplayAllowed || !this.heroVisible || this.videoRevealed) {
      return;
    }

    await player
      .play()
      .then(() => {
        this.videoRevealed = true;
      })
      .catch(() => {});
  }

  private observeHeroVisibility(frame: HTMLIFrameElement): void {
    if (typeof IntersectionObserver === 'undefined' || this.visibilityObserver) return;

    this.visibilityObserver = new IntersectionObserver(
      ([entry]) => this.onHeroVisibilityChange(Boolean(entry?.isIntersecting)),
      { threshold: 0.05 },
    );
    this.visibilityObserver.observe(frame);
  }

  private updateHeroCopyVisibility(currentTime: number): void {
    this.heroCopyVisible =
      currentTime <= this.heroCopyVisibleForSeconds ||
      (this.videoDuration > 0 && currentTime >= this.videoDuration - this.heroCopyReturnForSeconds);
  }

  private prefersReducedMotion(): boolean {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private createPlayerUrl(): string {
    const parameters = new URLSearchParams({
      autoplay: this.autoplayAllowed ? '1' : '0',
      autopause: '0',
      background: '1',
      badge: '0',
      byline: '0',
      controls: '0',
      dnt: '1',
      loop: '1',
      muted: '1',
      playsinline: '1',
      portrait: '0',
      title: '0',
    });

    return `https://player.vimeo.com/video/1217274878?${parameters.toString()}`;
  }
}
