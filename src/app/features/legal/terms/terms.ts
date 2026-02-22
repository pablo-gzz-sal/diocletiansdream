import { Component } from '@angular/core';
import { PolicyPageComponent } from '../policy-page-component/policy-page-component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [PolicyPageComponent],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms {

}
