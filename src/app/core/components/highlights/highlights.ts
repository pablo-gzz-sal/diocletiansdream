import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-highlights',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './highlights.html',
  styleUrl: './highlights.css',
})
export class Highlights {

}
