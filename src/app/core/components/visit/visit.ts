import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';

@Component({
  selector: 'app-visit',
  standalone: true,
  imports: [TranslateModule, RevealOnScrollDirective],
  templateUrl: './visit.html',
  styleUrl: './visit.css',
})
export class Visit {

}
