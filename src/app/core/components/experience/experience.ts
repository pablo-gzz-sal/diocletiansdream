import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, RevealOnScrollDirective],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience implements AfterViewInit, OnDestroy {
  private ctx?: gsap.Context;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const root = this.el.nativeElement;

    this.ctx = gsap.context(() => {
      // ── 1. Stat counters — count up when cells enter view ────
      const countEls = root.querySelectorAll<HTMLElement>('.stat-count');
      countEls.forEach((el) => {
        const target = parseInt(el.dataset['target'] ?? '0', 10);
        // Start near the target for large numbers so it doesn't feel too slow
        const startVal = target > 100 ? target - 46 : 0;
        const proxy = { val: startVal };

        ScrollTrigger.create({
          trigger: el,
          start: 'top 82%',
          once: true,
          onEnter: () => {
            gsap.to(proxy, {
              val: target,
              duration: target > 100 ? 1.5 : 2.0,
              ease: 'power3.out',
              snap: { val: 1 },
              onUpdate: () => {
                el.textContent = String(Math.round(proxy.val));
              },
            });
          },
        });
      });

      // ── 2. Bento image cells — inner parallax on scroll ─────
      const imgCells = root.querySelectorAll<HTMLElement>(
        '.bento-cell--imgA, .bento-cell--imgB, .bento-cell--imgC',
      );
      imgCells.forEach((cell) => {
        const inner = cell.querySelector<HTMLElement>('.bento-img-placeholder');
        if (!inner) return;
        gsap.fromTo(
          inner,
          { y: 18 },
          {
            scrollTrigger: {
              trigger: cell,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
            y: -18,
            ease: 'none',
          },
        );
      });
    }, root);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
