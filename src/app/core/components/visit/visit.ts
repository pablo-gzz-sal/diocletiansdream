import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-visit',
  standalone: true,
  imports: [RouterLink, TranslateModule, RevealOnScrollDirective],
  templateUrl: './visit.html',
  styleUrl: './visit.css',
})
export class Visit implements AfterViewInit, OnDestroy {
  private ctx?: gsap.Context;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const root = this.el.nativeElement;

    this.ctx = gsap.context(() => {
      // ── Vcards: directional stagger (left → center → right) ──
      // vcards have NO revealOnScroll directive — GSAP owns them entirely
      const vcards = root.querySelectorAll<HTMLElement>('.vcard');
      const xOffsets = [-45, 0, 45] as const;

      vcards.forEach((card, i) => {
        // Start invisible (since revealOnScroll is removed from template)
        gsap.set(card, { opacity: 0, x: xOffsets[i] ?? 0, y: i === 1 ? 28 : 14 });

        ScrollTrigger.create({
          trigger: card,
          start: 'top 84%',
          once: true,
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.82,
              delay: i * 0.1,
              ease: 'power3.out',
              clearProps: 'transform',
            });
          },
        });
      });

      // ── Vcard ordinal numbers: subtle scale pop ───────────────
      const nums = root.querySelectorAll<HTMLElement>('.vcard-num');
      nums.forEach((num, i) => {
        gsap.set(num, { opacity: 0, scale: 0.5 });
        ScrollTrigger.create({
          trigger: num,
          start: 'top 84%',
          once: true,
          onEnter: () => {
            gsap.to(num, {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              delay: i * 0.1 + 0.18,
              ease: 'back.out(1.8)',
            });
          },
        });
      });
    }, root);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
