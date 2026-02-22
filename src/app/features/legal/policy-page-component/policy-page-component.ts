import { Component, Input, OnInit } from '@angular/core';
import { Header } from '../../../core/components/header/header';
import { Footer } from '../../../core/components/footer/footer';

@Component({
  selector: 'app-policy-page-component',
  standalone: true,
  imports: [Header, Footer],
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
