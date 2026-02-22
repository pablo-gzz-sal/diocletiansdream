import { Routes } from '@angular/router';
import { BlogListPage } from './features/blog/blog-list-page/blog-list-page';
import { BlogPostPage } from './features/blog/blog-post-page/blog-post-page';
import { LandingPage } from './features/landing-page/landing-page';
import { Booking } from './features/booking/booking';
import { Contact } from './features/contact/contact';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'booking', component: Booking },
  { path: 'contact', component: Contact },
  //   {
  //     path: 'booking',
  //     loadComponent: () =>
  //       import('./pages/booking/booking-page.component').then((m) => m.BookingPageComponent),
  //   },
  { path: 'blog', component: BlogListPage },
  { path: 'blog/:slug', component: BlogPostPage },
  { path: '**', redirectTo: '' },
];
