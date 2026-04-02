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
  @Input() revealY = 28;

  private st?: ScrollTrigger;
  private anim?: gsap.core.Tween;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const el = this.el.nativeElement;

    gsap.set(el, { opacity: 0, y: this.revealY, willChange: 'opacity, transform' });

    this.anim = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      delay: this.revealDelay,
      ease: 'power3.out',
      paused: true,
      clearProps: 'willChange',
    });

    this.st = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => this.anim?.play(),
    });
  }

  ngOnDestroy(): void {
    this.st?.kill();
    this.anim?.kill();
  }
}
