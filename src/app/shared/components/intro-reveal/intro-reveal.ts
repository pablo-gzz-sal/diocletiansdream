import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-intro-reveal',
  standalone: true,
  imports: [CommonModule],
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
      gsap.set(this.overlay.nativeElement, { yPercent: 0 });
      gsap.set(this.image.nativeElement, { scale: 1, y: 0 });
      gsap.set(this.content.nativeElement, { y: 0, autoAlpha: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: this.spacer.nativeElement,
          start: 'top top',
          end: 'bottom top', 
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.to(this.image.nativeElement, { scale: 1.06, y: -20, ease: 'none' }, 0);
      tl.to(this.content.nativeElement, { y: -30, ease: 'none' }, 0);

      tl.to(this.overlay.nativeElement, { yPercent: -100, ease: 'none' }, 0);

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