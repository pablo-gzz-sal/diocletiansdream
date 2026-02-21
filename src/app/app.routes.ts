import { Routes } from '@angular/router';
import { BlogListPage } from './features/blog/blog-list-page/blog-list-page';
import { BlogPostPage } from './features/blog/blog-post-page/blog-post-page';
import { LandingPage } from './features/landing-page/landing-page';

export const routes: Routes = [
  { path: '', component: LandingPage },
//   {
//     path: 'booking',
//     loadComponent: () =>
//       import('./pages/booking/booking-page.component').then((m) => m.BookingPageComponent),
//   },
  { path: 'blog', component: BlogListPage },
  { path: 'blog/:slug', component: BlogPostPage },
  { path: '**', redirectTo: '' },
];
