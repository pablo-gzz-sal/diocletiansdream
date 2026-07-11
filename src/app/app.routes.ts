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
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'booking', component: Booking },
  { path: 'visit', component: Contact },
  { path: 'about', component: About },
  { path: 'blog', component: BlogListPage },
  // Legacy /blog/:slug URLs now live at the root — redirect to the new location.
  { path: 'blog/:slug', redirectTo: (r) => `/${r.params['slug']}` },
  { path: 'privacy', component: Privacy },
  { path: 'terms', component: Terms },
  { path: 'cookies', component: Cookies },
  { path: 'experience', component: Experience },
  // Root-level blog posts, e.g. /what-to-do-in-split. Must stay AFTER all
  // fixed routes so it only catches single-segment slugs that nothing else owns.
  { path: ':slug', component: BlogPostPage },
  // Anything else is a real 404 (renders the NotFound page, not the homepage).
  { path: '**', component: NotFound },
];
