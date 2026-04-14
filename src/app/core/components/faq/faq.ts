import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import gsap from 'gsap';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';

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

  faqs: any[] = [
    {
      q: 'How long is the experience?',
      a: 'The VR museum experience lasts about 15 minutes.',
      open: true,
    },
    {
      q: 'Do I need to book in advance?',
      a: 'Booking is recommended so you get your preferred time slot.',
      open: false,
    },
    {
      q: 'Is it suitable for kids?',
      a: "Yes, it's family-friendly (you can specify a minimum age if you want).",
      open: false,
    },
    {
      q: 'Is it near the Palace?',
      a: "Yes — it's designed to pair perfectly with a walk around Diocletian's Palace.",
      open: false,
    },
  ];

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    // Panel at index 0 is the newsletter (always open) — skip it.
    // Panels at indices 1…N correspond to faqs[0…N-1].
    const panels = this.el.nativeElement.querySelectorAll<HTMLElement>('.faq-a');

    panels.forEach((panel, i) => {
      if (i === 0) {
        // Newsletter panel — always visible
        gsap.set(panel, { height: 'auto', opacity: 1 });
      } else {
        const faq = this.faqs[i - 1];
        gsap.set(panel, { height: faq?.open ? 'auto' : 0, opacity: faq?.open ? 1 : 0 });
      }
    });
  }

  toggleFaq(i: number): void {
    const isOpening = !this.faqs[i].open;
    const panels = this.el.nativeElement.querySelectorAll<HTMLElement>('.faq-a');

    // Mutate open flag directly — keeps *ngFor DOM nodes stable so GSAP
    // references remain valid (spread/map creates new objects, Angular
    // recreates elements, and the animation targets detached nodes).
    if (isOpening) {
      this.faqs.forEach((faq, idx) => {
        if (idx !== i && faq.open) {
          faq.open = false;
          const p = panels[idx + 1];
          if (p) gsap.to(p, { height: 0, opacity: 0, duration: 0.28, ease: 'power2.in' });
        }
      });
      this.faqs[i].open = true;
    } else {
      this.faqs[i].open = false;
    }

    // Panel index offset by 1 (newsletter occupies slot 0)
    const panel = panels[i + 1];
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
