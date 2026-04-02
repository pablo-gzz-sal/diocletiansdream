import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RevealOnScrollDirective } from '../../../shared/animations/reveal-on-scroll-directive';

@Component({
  selector: 'app-about-project',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealOnScrollDirective],
  templateUrl: './about-project.html',
  styleUrl: './about-project.css',
})
export class AboutProject {

}
