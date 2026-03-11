import { CommonModule } from '@angular/common';
import { AfterViewInit, OnDestroy, ElementRef, ViewChild, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-intro-reveal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './intro-reveal.html',
  styleUrl: './intro-reveal.css',
})
export class IntroReveal implements AfterViewInit, OnDestroy {
  @ViewChild('spacer', { static: true }) spacer!: ElementRef<HTMLElement>;
  @ViewChild('overlay', { static: true }) overlay!: ElementRef<HTMLElement>;
  @ViewChild('image', { static: true }) image!: ElementRef<HTMLElement>;
  @ViewChild('content', { static: true }) content!: ElementRef<HTMLElement>;

  private ctx?: gsap.Context;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    this.ctx = gsap.context(() => {
      // Initial states
      gsap.set(this.overlay.nativeElement, { yPercent: 0 });
      gsap.set(this.image.nativeElement, { scale: 1, y: 0 });
      gsap.set(this.content.nativeElement, { y: 0, autoAlpha: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: this.spacer.nativeElement,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.4, // smooth lerp — the most impactful change
          invalidateOnRefresh: true,
        },
      });

      // Image: parallax drift + subtle scale, eased so it accelerates gently
      tl.to(this.image.nativeElement, { scale: 1.08, y: -60, ease: 'power1.in' }, 0);

      // Content: rises + fades out in the first 60% of scroll
      tl.to(this.content.nativeElement, { y: -60, autoAlpha: 0, ease: 'power2.in' }, 0);

      // Overlay: stays put for the first 15%, then slides off fast — feels deliberate
      tl.to(
        this.overlay.nativeElement,
        { yPercent: -100, ease: 'power2.inOut' },
        0.15, // offset: starts after a short hold
      );

      // Disable pointer events once fully scrolled past
      ScrollTrigger.create({
        trigger: this.spacer.nativeElement,
        start: 'bottom top',
        onEnter: () => gsap.set(this.overlay.nativeElement, { pointerEvents: 'none' }),
        onLeaveBack: () => gsap.set(this.overlay.nativeElement, { pointerEvents: 'auto' }),
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
