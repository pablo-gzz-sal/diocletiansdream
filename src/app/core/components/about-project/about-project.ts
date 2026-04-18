import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about-project',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, RevealOnScrollDirective],
  templateUrl: './about-project.html',
  styleUrl: './about-project.css',
})
export class AboutProject implements AfterViewInit, OnDestroy {
  private ctx?: gsap.Context;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const root = this.el.nativeElement;

    this.ctx = gsap.context(() => {
      // ── Image cell: subtle scroll parallax ───────────────────
      const imgCell = root.querySelector<HTMLElement>('.bento-cell--imgA');
      if (imgCell) {
        const inner = imgCell.querySelector<HTMLElement>('.bento-img-placeholder');
        if (inner) {
          gsap.fromTo(
            inner,
            { y: 22 },
            {
              scrollTrigger: {
                trigger: imgCell,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.4,
              },
              y: -22,
              ease: 'none',
            },
          );
        }
      }
    }, root);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
