import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [Header, Footer, CommonModule, FormsModule, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  submitting = false;
  submitted = false;

  constructor(
    private title: Title,
    private meta: Meta,
  ) {
    this.title.setTitle("Contact — Diocletian's Dream VR Museum | Split");
    this.meta.updateTag({
      name: 'description',
      content:
        "Get in touch with Diocletian's Dream. Find our address in Split's Old Town, opening hours, ticket prices, and contact details.",
    });
  }

  onSubmit() {
    this.submitting = true;
    // Wire up to your backend / EmailJS / Formspree here
    setTimeout(() => {
      this.submitting = false;
      this.submitted = true;
    }, 1200);
  }

  onNewsletterSubmit() {
    // Wire up to your newsletter provider here
  }
}
