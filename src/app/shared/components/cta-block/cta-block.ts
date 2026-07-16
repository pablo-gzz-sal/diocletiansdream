import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocalePathPipe } from '../../../core/i18n/locale-path.pipe';
export type CtaVariant = 'light' | 'dark';

@Component({
  selector: 'app-cta-block',
  standalone: true,
  imports: [RouterLink, TranslateModule, LocalePathPipe],
  templateUrl: './cta-block.html',
  styleUrl: './cta-block.css',
})
export class CtaBlock {
  @Input() variant: CtaVariant = 'light';

  // Text
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() text = '';

  // Primary CTA
  @Input() primaryLabel = '';
  @Input() primaryLink: string | any[] = '/booking';

  // Secondary CTA
  @Input() secondaryLabel = '';
  @Input() secondaryLink: string | any[] = '/experience';

  // Optional quick links (small pills)
  @Input() quickLinks: { label: string; link: string | any[] }[] = [];
}
