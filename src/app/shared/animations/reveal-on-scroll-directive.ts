import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Directive({
  selector: '[revealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  @Input() revealDelay = 0;
  @Input() revealY = 22;
  /** When true, uses a clip-path wipe-up reveal instead of opacity+translateY */
  @Input() revealClip = false;

  private st?: ScrollTrigger;
  private anim?: gsap.core.Tween;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const el = this.el.nativeElement;

    if (this.revealClip) {
      // Clip-path wipe-up — editorial reveal (no opacity/y change, pure mask wipe)
      gsap.set(el, { clipPath: 'inset(0 0 100% 0)', willChange: 'clip-path' });
      this.anim = gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.95,
        delay: this.revealDelay,
        ease: 'power3.out',
        paused: true,
        clearProps: 'willChange,clipPath',
      });
    } else {
      // Standard fade + gentle rise
      gsap.set(el, { opacity: 0, y: this.revealY, willChange: 'opacity, transform' });
      this.anim = gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.78,
        delay: this.revealDelay,
        ease: 'power2.out',
        paused: true,
        clearProps: 'willChange',
      });
    }

    this.st = ScrollTrigger.create({
      trigger: el,
      // Fire when top of element crosses 84% from top of viewport —
      // earlier trigger means smoother, less "pop-in" feel
      start: 'top 84%',
      once: true,
      onEnter: () => this.anim?.play(),
    });
  }

  ngOnDestroy(): void {
    this.st?.kill();
    this.anim?.kill();
  }
}
