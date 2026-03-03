import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {

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
      a: 'Yes, it’s family-friendly (you can specify a minimum age if you want).',
      open: false,
    },
    {
      q: 'Is it near the Palace?',
      a: 'Yes — it’s designed to pair perfectly with a walk around Diocletian’s Palace.',
      open: false,
    },
  ];

    toggleFaq(i: number) {
    this.faqs = this.faqs.map((x, idx) => (idx === i ? { ...x, open: !x.open } : x));
  }

    onSubscribe(): void {
    if (!this.newsletterEmail) return;

    this.isSubmitting = true;
    console.log('Newsletter email:', this.newsletterEmail);

    setTimeout(() => {
      this.isSubmitting = false;
      this.newsletterEmail = '';

      alert('Subscribed successfully!');
    }, 1000);
  }

}
