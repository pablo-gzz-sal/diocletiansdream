import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about-project',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './about-project.html',
  styleUrl: './about-project.css',
})
export class AboutProject {

}
