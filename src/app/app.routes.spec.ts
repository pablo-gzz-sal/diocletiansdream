import { Routes } from '@angular/router';
import { routes } from './app.routes';
import { LandingPage } from './features/landing-page/landing-page';
import { Experience } from './features/experience/experience';
import { Contact } from './features/contact/contact';
import { About } from './features/about/about';
import { Booking } from './features/booking/booking';
import { NotFound } from './features/not-found/not-found';
import { BlogPostPage } from './features/blog/blog-post-page/blog-post-page';
import { ThankYou } from './features/thank-you/thank-you';

/**
 * Minimal first-match route walk, mirroring the router's own precedence rules.
 * These tests exist because a precedence mistake here fails SILENTLY: /hr/ would
 * prerender as a (nonexistent) blog post and emit noindex, in a build that
 * otherwise looks completely successful.
 */
function match(url: string): unknown {
  const segments = url.split('/').filter(Boolean);

  function walk(rs: Routes, segs: string[]): unknown {
    for (const r of rs) {
      const path = r.path ?? '';
      if (path === '**') return r.component;

      const parts = path === '' ? [] : path.split('/');
      if (parts.length > segs.length) continue;

      const consumed = parts.every((p, i) => p.startsWith(':') || p === segs[i]);
      if (!consumed) continue;

      const rest = segs.slice(parts.length);
      if (r.children) {
        const hit = walk(r.children, rest);
        if (hit) return hit;
        continue;
      }
      // A leaf only matches if it consumed the whole URL.
      if (rest.length === 0) return r.component;
    }
    return undefined;
  }

  return walk(routes, segments);
}

describe('app routes precedence', () => {
  it('routes /hr/ to the landing page, not a blog post', () => {
    expect(match('/hr')).toBe(LandingPage);
  });

  it('routes the Croatian slugs to their pages', () => {
    expect(match('/hr/iskustvo')).toBe(Experience);
    expect(match('/hr/posjet')).toBe(Contact);
    expect(match('/hr/o-nama')).toBe(About);
    expect(match('/hr/rezervacija')).toBe(Booking);
  });

  it('does NOT serve the English slug under /hr/', () => {
    // /hr/experience/ is not a real URL — only /hr/iskustvo/ is.
    expect(match('/hr/experience')).toBe(NotFound);
  });

  it('routes /dd-thankyou/ to the thank-you page, not a blog post', () => {
    expect(match('/dd-thankyou')).toBe(ThankYou);
  });

  it('still routes an ordinary slug to the blog post page', () => {
    expect(match('/what-to-do-in-split')).toBe(BlogPostPage);
  });

  it('routes the English home and experience pages unchanged', () => {
    expect(match('/')).toBe(LandingPage);
    expect(match('/experience')).toBe(Experience);
  });

  it('stamps a lang on every leaf so languageResolver always has one', () => {
    const leaves = (rs: Routes): Routes =>
      rs.flatMap((r) => (r.children ? leaves(r.children) : [r]));

    for (const leaf of leaves(routes)) {
      // dd-thankyou is intentionally not localized (noindex, English-only).
      if (leaf.component === ThankYou) continue;
      expect(leaf.data?.['lang'])
        .withContext(`route "${leaf.path}" has no data.lang`)
        .toBeDefined();
      expect(leaf.resolve?.['lang'])
        .withContext(`route "${leaf.path}" has no language resolver`)
        .toBeDefined();
    }
  });
});
