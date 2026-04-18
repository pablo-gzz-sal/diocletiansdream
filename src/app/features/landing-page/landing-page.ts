import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/animations/reveal-on-scroll-directive';
import { CommonModule } from '@angular/common';
import { WpService } from '../../shared/services/wp-service';
import { SeoService } from '../../shared/services/seo-service';
import { IntroReveal } from '../../shared/components/intro-reveal/intro-reveal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { BlogInvite } from '../../shared/components/blog-invite/blog-invite';
import { Hero } from '../../core/components/hero/hero';
import { Experience } from '../../core/components/experience/experience';
import { Visit } from '../../core/components/visit/visit';
import { Reviews } from '../../core/components/reviews/reviews';
import { Faq } from '../../core/components/faq/faq';
import { AboutProject } from '../../core/components/about-project/about-project';
import { Highlights } from '../../core/components/highlights/highlights';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    AboutProject,
    Highlights
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('spotlight', { static: true }) spotRef!: ElementRef<HTMLElement>;

  marqueeItems: string[] = [];
  blogCards!: any;

  private cleanups: Array<() => void> = [];

  constructor(
    private seo: SeoService,
    private wpService: WpService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.applySeo();
    this.translate.get('home.marquee.items').subscribe((items: string[]) => {
      this.marqueeItems = items;
    });
    this.getBlogs();
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── ScrollTrigger global refresh ─────────────────────────────
    // After Angular finishes rendering all child components, recalculate
    // all trigger positions so nothing fires at the wrong scroll offset.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });

    if (reduced) return;

    // ── Cursor spotlight: smooth GSAP lag behind the mouse ──────
    const spot = this.spotRef.nativeElement;
    const qx = gsap.quickTo(spot, 'x', { duration: 0.45, ease: 'power2.out' });
    const qy = gsap.quickTo(spot, 'y', { duration: 0.45, ease: 'power2.out' });

    let entered = false;
    const onMove = (e: MouseEvent) => {
      if (!entered) {
        spot.style.opacity = '1';
        entered = true;
      }
      qx(e.clientX);
      qy(e.clientY);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    this.cleanups.push(() => document.removeEventListener('mousemove', onMove));
  }

  ngOnDestroy(): void {
    this.cleanups.forEach(fn => fn());
    this.cleanups = [];
  }

  getBlogs() {
    this.wpService.getSamplePosts().subscribe((posts) => {
      this.blogCards = posts;
    });
  }

  private applySeo(): void {
    const title = "Diocletian's Dream VR Museum | Step back into 305 AD";
    const description = "A 15-minute VR museum experience in Split that brings Diocletian's Palace back to life in 305 AD. Located just outside the palace walls near the Golden Gate. Book tickets online.";

    this.seo.setTitle(title);
    this.seo.setDescription(description);
    this.seo.setCanonical('https://diocletiansdream.com/');
    this.seo.setOpenGraph({
      title,
      description,
      url: 'https://diocletiansdream.com/',
      type: 'website',
    });

    this.seo.setJsonLd('ld-local-business', {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'TouristAttraction'],
      name: "Diocletian's Dream VR Museum",
      description,
      url: 'https://diocletiansdream.com',
      telephone: '+38521886015',
      email: 'contact@diocletiansdream.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Zagrebačka ul. 1',
        addressLocality: 'Split',
        postalCode: '21000',
        addressCountry: 'HR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 43.5081,
        longitude: 16.4402,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '11:00',
          closes: '16:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/diocletiansdream/',
        'https://www.facebook.com/diocletiansdream/',
        'https://www.tripadvisor.com/Attraction_Review-g295370-d20921353',
      ],
    });
  }
}
