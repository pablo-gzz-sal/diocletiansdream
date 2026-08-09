import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';

interface Partner {
  num: string;
  /** Brand name — intentionally not translated. */
  name: string;
  href: string;
  /** i18n key, resolved by the translate pipe — see home.partners.items. */
  text: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [TranslateModule, RevealOnScrollDirective],
  templateUrl: './partners.html',
  styleUrl: './partners.css',
})
export class Partners {
  partners: Partner[] = [
    {
      num: '01',
      name: 'Split Rafting Adventure',
      href: 'https://split-rafting.eu/',
      text: 'home.partners.items.rafting.text',
    },
    {
      num: '02',
      name: 'Split Food Tour',
      href: 'https://splitfoodtour.com/',
      text: 'home.partners.items.food.text',
    },
    {
      num: '03',
      name: 'Visit Split Croatia',
      href: 'https://visitsplitcroatia.com/',
      text: 'home.partners.items.bus.text',
    },
  ];
}
