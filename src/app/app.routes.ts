import { Routes } from '@angular/router';
import { BlogListPage } from './features/blog/blog-list-page/blog-list-page';
import { BlogPostPage } from './features/blog/blog-post-page/blog-post-page';
import { LandingPage } from './features/landing-page/landing-page';
import { Booking } from './features/booking/booking';
import { Contact } from './features/contact/contact';
import { About } from './features/about/about';
import { Privacy } from './features/legal/privacy/privacy';
import { Terms } from './features/legal/terms/terms';
import { Cookies } from './features/legal/cookies/cookies';
import { Experience } from './features/experience/experience';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'booking', component: Booking },
  { path: 'visit', component: Contact },
  { path: 'about', component: About },
  { path: 'blog', component: BlogListPage },
  { path: 'blog/:slug', component: BlogPostPage },
  { path: 'privacy', component: Privacy },
  { path: 'terms', component: Terms },
  { path: 'cookies', component: Cookies },
  { path: 'experience', component: Experience },
  { path: '**', redirectTo: '' },
];
