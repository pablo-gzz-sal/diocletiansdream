import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-policy-page-component',
  standalone: true,
  imports: [],
  templateUrl: './policy-page-component.html',
  styleUrl: './policy-page-component.css',
})
export class PolicyPageComponent implements OnInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) updatedAt?: string;

  ngOnInit() {
    window.scroll(0, 0);
  }
}
