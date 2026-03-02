import { Component, OnInit } from '@angular/core';
import { Header } from '../../core/components/header/header';
import { Footer } from '../../core/components/footer/footer';
import { BlogInvite } from '../../shared/components/blog-invite/blog-invite';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [Header, Footer, BlogInvite],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {

  ngOnInit(): void {
  // existing title/meta code...
window.scroll(0, 0);
  // Load Turitop after component renders
  const script = document.createElement('script');
  script.id = 'js-turitop';
  script.src = 'https://app.turitop.com/js/load-turitop.min.js'; // your full src URL
  script.async = true;
  document.body.appendChild(script);
}

}
