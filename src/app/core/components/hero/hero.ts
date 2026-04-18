import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, RevealOnScrollDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements AfterViewInit, OnDestroy {
  private ctx?: gsap.Context;
  private cleanups: Array<() => void> = [];

  tiles = [
    { label: '305 AD', span: 'tile-span-2' },
    { label: 'VR Museum', span: 'tile-span-1' },
    { label: 'UNESCO', span: 'tile-span-1' },
    { label: 'Reconstruction', span: 'tile-span-2' },
    { label: 'Split', span: 'tile-span-3' },
    { label: 'Diocletian', span: 'tile-span-3' },
  ];

  visitCards = [
    {
      title: 'Location',
      text: "Right by Diocletian's Palace — easy to combine with your Old Town walk.",
      cta: 'Get tickets',
      link: '/booking',
    },
    {
      title: 'Duration',
      text: 'A focused 15-minute VR show, designed to fit any itinerary.',
      cta: 'Book a slot',
      link: '/booking',
    },
    {
      title: 'Before you go',
      text: 'Arrive a few minutes early and keep your schedule relaxed after.',
      cta: 'Read guide',
      link: '/blog',
    },
  ];

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    // Respect reduced-motion preference
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const root = this.el.nativeElement;

    this.ctx = gsap.context(() => {
      if (!reduced) {
        // ── 1. Tile grid: random stagger reveal ──────────────────
        const tiles = root.querySelectorAll<HTMLElement>('.tile');
        if (tiles.length) {
          gsap.from(tiles, {
            scrollTrigger: {
              trigger: root.querySelector('.tile-grid'),
              start: 'top 84%',
              once: true,
            },
            y: 20,
            scale: 0.95,
            opacity: 0,
            duration: 0.65,
            ease: 'power2.out',
            stagger: { amount: 0.4, from: 'random' },
          });
        }
      }
    }, root);

    if (!reduced) {
      // ── 2. Hero card 3D perspective tilt on hover ─────────────
      const card = root.querySelector<HTMLElement>('.hero-card');
      if (card) {
        const onCardMove = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const cx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
          const cy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
          gsap.to(card, {
            rotateX: cy * -4,
            rotateY: cx * 6,
            transformPerspective: 1000,
            transformOrigin: 'center center',
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        const onCardLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 1.0,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        };
        card.addEventListener('mousemove', onCardMove);
        card.addEventListener('mouseleave', onCardLeave);
        this.cleanups.push(
          () => card.removeEventListener('mousemove', onCardMove),
          () => card.removeEventListener('mouseleave', onCardLeave),
        );
      }

      // ── 3. Blob wrapper mouse parallax ───────────────────────
      // Wrappers translate on mouse move; inner blobs keep their CSS float animation
      const wrap1 = root.querySelector<HTMLElement>('.hero-blob-wrap--1');
      const wrap2 = root.querySelector<HTMLElement>('.hero-blob-wrap--2');
      const heroSection = root.querySelector<HTMLElement>('.hero') ?? root;

      if (wrap1 && wrap2) {
        // quickTo for silky, decoupled x/y tracking
        const qW1x = gsap.quickTo(wrap1, 'x', { duration: 2.2, ease: 'power1.out' });
        const qW1y = gsap.quickTo(wrap1, 'y', { duration: 2.2, ease: 'power1.out' });
        const qW2x = gsap.quickTo(wrap2, 'x', { duration: 2.2, ease: 'power1.out' });
        const qW2y = gsap.quickTo(wrap2, 'y', { duration: 2.2, ease: 'power1.out' });

        const onHeroMove = (e: MouseEvent) => {
          const r = heroSection.getBoundingClientRect();
          if (r.height <= 0) return;
          const cx = (e.clientX - r.left) / r.width - 0.5;
          const cy = (e.clientY - r.top) / r.height - 0.5;
          qW1x(cx * 48);
          qW1y(cy * 32);
          qW2x(cx * -36);
          qW2y(cy * -26);
        };

        heroSection.addEventListener('mousemove', onHeroMove, { passive: true });
        this.cleanups.push(() => heroSection.removeEventListener('mousemove', onHeroMove));
      }
    }
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    this.cleanups.forEach(fn => fn());
    this.cleanups = [];
  }
}
