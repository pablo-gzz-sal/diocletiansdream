import { Component, OnInit } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';
import { Meta, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { WpService } from '../../shared/services/wp-service';
import { IntroReveal } from '../../shared/components/intro-reveal/intro-reveal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { BlogInvite } from '../../shared/components/blog-invite/blog-invite';
import { Hero } from '../../core/components/hero/hero';
import { Experience } from '../../core/components/experience/experience';
import { Visit } from '../../core/components/visit/visit';
import { Reviews } from '../../core/components/reviews/reviews';
import { Faq } from '../../core/components/faq/faq';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    RouterLink,
    Header,
    Footer,
    FormsModule,
    CommonModule,
    IntroReveal,
    TranslateModule,
    BlogInvite,
    Hero,
    Experience,
    Visit,
    Reviews,
    Faq,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  marqueeItems: string[] = [];

  blogCards!: any;

  constructor(
    private title: Title,
    private meta: Meta,
    private wpService: WpService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.setSeoTags();
    this.title.setTitle('Diocletian’s Dream VR Museum | Step back into 305 AD');
    this.meta.updateTag({
      name: 'description',
      content:
        'A 15-minute VR museum experience in Split that brings Diocletian’s Palace back to life in 305 AD. Book tickets and plan your visit.',
    });
    this.meta.updateTag({ property: 'og:title', content: 'Diocletian’s Dream VR Museum | 305 AD' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Step into a VR reconstruction of Diocletian’s Palace and understand the UNESCO site like never before.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });
    this.translate.get('home.marquee.items').subscribe((items: string[]) => {
      this.marqueeItems = items;
    });
    this.getBlogs();
  }

  getBlogs() {
    this.wpService.getSamplePosts().subscribe((posts) => {
      this.blogCards = posts;
    });
  }

  private setSeoTags(): void {
    this.translate.get('home.hero.title').subscribe((titleText: string) => {
      // Browser tab title
      this.title.setTitle(titleText);

      // Primary meta description
      this.meta.updateTag({
        name: 'description',
        content:
          'Diocletian’s Palace VR experience in Split. Step into 305 AD through an immersive virtual reality museum experience inside the UNESCO Old Town.',
      });

      // Optional keywords (Google mostly ignores but still useful)
      this.meta.updateTag({
        name: 'keywords',
        content:
          'Diocletian’s Palace VR experience, virtual reality Split, VR museum Split, immersive historical experience Split, Roman history experience Croatia',
      });

      // OpenGraph (for social sharing)
      this.meta.updateTag({
        property: 'og:title',
        content: titleText,
      });

      this.meta.updateTag({
        property: 'og:description',
        content:
          'Experience Diocletian’s Palace in virtual reality inside Split’s UNESCO Old Town.',
      });
    });
  }
}
