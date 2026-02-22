import { Component, OnInit } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Header, Footer],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit{
  ngOnInit(): void {
    window.scroll(0, 0);
  }
}
