import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import gsap from 'gsap';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';

interface FaqItem {
  /** i18n key */
  q: string;
  /** i18n key */
  a: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, RevealOnScrollDirective],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq implements AfterViewInit {
  newsletterEmail: string = '';
  isSubmitting: boolean = false;

  /** q/a hold i18n keys, resolved by the translate pipe — see home.faq.items. */
  faqs: FaqItem[] = [
    { q: 'home.faq.items.duration.q', a: 'home.faq.items.duration.a', open: true },
    { q: 'home.faq.items.booking.q', a: 'home.faq.items.booking.a', open: false },
    { q: 'home.faq.items.age.q', a: 'home.faq.items.age.a', open: false },
    { q: 'home.faq.items.location.q', a: 'home.faq.items.location.a', open: false },
  ];

  constructor(private el: ElementRef<HTMLElement>) {}

  /**
   * Scoped to [data-faq-item] so panels[i] always pairs with faqs[i] — the
   * newsletter panel is also a .faq-a and would otherwise shift every index.
   *
   * Queried fresh on each use rather than cached in a @ViewChildren: hydration
   * swaps these nodes after ngAfterViewInit, so cached ElementRefs go stale and
   * the tweens end up animating detached elements.
   */
  private panels(): HTMLElement[] {
    return Array.from(
      this.el.nativeElement.querySelectorAll<HTMLElement>('[data-faq-item] .faq-a'),
    );
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    this.panels().forEach((panel, i) => {
      const faq = this.faqs[i];
      gsap.set(panel, { height: faq?.open ? 'auto' : 0, opacity: faq?.open ? 1 : 0 });
    });
  }

  toggleFaq(i: number): void {
    const isOpening = !this.faqs[i].open;
    const panels = this.panels();

    // Mutate open flag directly — keeps *ngFor DOM nodes stable so GSAP
    // references remain valid (spread/map creates new objects, Angular
    // recreates elements, and the animation targets detached nodes).
    if (isOpening) {
      this.faqs.forEach((faq, idx) => {
        if (idx !== i && faq.open) {
          faq.open = false;
          const p = panels[idx];
          if (p) gsap.to(p, { height: 0, opacity: 0, duration: 0.28, ease: 'power2.in' });
        }
      });
      this.faqs[i].open = true;
    } else {
      this.faqs[i].open = false;
    }

    const panel = panels[i];
    if (!panel) return;

    if (isOpening) {
      // GSAP natively handles height:'auto' — measures, animates, cleans up
      gsap.fromTo(panel,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.42, ease: 'power2.out' }
      );
    } else {
      gsap.to(panel, { height: 0, opacity: 0, duration: 0.28, ease: 'power2.in' });
    }
  }

  onSubscribe(): void {
    if (!this.newsletterEmail) return;
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.newsletterEmail = '';
      alert('Subscribed successfully!');
    }, 1000);
  }
}
