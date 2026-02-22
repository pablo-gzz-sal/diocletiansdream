import { Component } from '@angular/core';
import { PolicyPageComponent } from '../policy-page-component/policy-page-component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [PolicyPageComponent],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css',
})
export class Privacy {

}
