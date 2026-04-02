import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [TranslateModule, RevealOnScrollDirective],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews {

}
