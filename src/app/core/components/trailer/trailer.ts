import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { environment } from '../../../../environments/environment';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-trailer',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealOnScrollDirective],
  templateUrl: './trailer.html',
  styleUrl: './trailer.css',
})
export class Trailer implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;

  /**
   * Served from the headless WordPress host (CMS subdomain) over https to avoid
   * mixed-content blocking. The root domain is the static Angular site now and
   * has no /wp-content, so the file must be fetched from wpBaseUrl.
   */
  readonly src = `${environment.wpBaseUrl.replace(/\/+$/, '')}/wp-content/uploads/2026/07/Sizzle-Reel-Diocletians-Dream.mp4`;
  readonly poster = 'assets/images/vr/emperor-peristyle.jpg';

  /** Once true, the mp4 is loaded, native controls appear and the poster fades out. */
  activated = false;

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private ctx?: gsap.Context;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const root = this.el.nativeElement;

    this.ctx = gsap.context(() => {
      // Cinematic entrance: the frame scales up subtly as it enters view.
      const frame = root.querySelector<HTMLElement>('.reel');
      if (frame) {
        gsap.from(frame, {
          scrollTrigger: { trigger: frame, start: 'top 82%', once: true },
          y: 40,
          scale: 0.96,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
        });
      }
    }, root);
  }

  play(): void {
    if (this.activated || !this.isBrowser) return;
    this.activated = true;

    // preload="none" means the source isn't fetched until now — kick it off.
    const v = this.videoRef?.nativeElement;
    if (!v) return;
    v.load();
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
