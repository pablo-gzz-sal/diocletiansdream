import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealOnScrollDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {

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
      text: "Right by Diocletian’s Palace — easy to combine with your Old Town walk.",
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

}
