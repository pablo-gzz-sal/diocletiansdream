import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';

@Component({
  selector: 'app-historical-authority',
  standalone: true,
  imports: [TranslateModule, RevealOnScrollDirective],
  templateUrl: './historical-authority.html',
  styleUrl: './historical-authority.css',
})
export class HistoricalAuthority {}
