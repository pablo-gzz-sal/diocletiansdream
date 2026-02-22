import { Component } from '@angular/core';
import { PolicyPageComponent } from '../policy-page-component/policy-page-component';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [PolicyPageComponent],
  templateUrl: './cookies.html',
  styleUrl: './cookies.css',
})
export class Cookies {

}
