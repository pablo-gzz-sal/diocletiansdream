import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealOnScrollDirective],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience {

}
