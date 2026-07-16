import { hasCounterpart, stripLocale, TRANSLATED_PATHS, withLocale } from './locale-url';
import { MARKETING_ROUTES } from './locale-routes';

describe('locale-url', () => {
  describe('stripLocale', () => {
    it('maps a Croatian slug back to its English path', () => {
      expect(stripLocale('/hr/iskustvo/')).toEqual({ lang: 'hr', path: '/experience' });
      expect(stripLocale('/hr/posjet/')).toEqual({ lang: 'hr', path: '/visit' });
      expect(stripLocale('/hr/o-nama/')).toEqual({ lang: 'hr', path: '/about' });
      expect(stripLocale('/hr/rezervacija/')).toEqual({ lang: 'hr', path: '/booking' });
      expect(stripLocale('/hr/')).toEqual({ lang: 'hr', path: '/' });
      expect(stripLocale('/hr')).toEqual({ lang: 'hr', path: '/' });
    });

    it('treats unprefixed URLs as English', () => {
      expect(stripLocale('/experience/')).toEqual({ lang: 'en', path: '/experience' });
      expect(stripLocale('/')).toEqual({ lang: 'en', path: '/' });
    });

    it('does not mistake an English slug that merely starts with "hr"', () => {
      expect(stripLocale('/hrvatska-povijest/')).toEqual({ lang: 'en', path: '/hrvatska-povijest' });
    });

    it('ignores query and fragment', () => {
      expect(stripLocale('/hr/rezervacija/?slot=3#top')).toEqual({ lang: 'hr', path: '/booking' });
    });
  });

  describe('withLocale', () => {
    it('leaves English at the root, untranslated', () => {
      expect(withLocale('/experience', 'en')).toBe('/experience');
      expect(withLocale('/visit', 'en')).toBe('/visit');
      expect(withLocale('/', 'en')).toBe('/');
    });

    it('prefixes AND translates Croatian', () => {
      expect(withLocale('/experience', 'hr')).toBe('/hr/iskustvo');
      expect(withLocale('/visit', 'hr')).toBe('/hr/posjet');
      expect(withLocale('/about', 'hr')).toBe('/hr/o-nama');
      expect(withLocale('/booking', 'hr')).toBe('/hr/rezervacija');
      expect(withLocale('/', 'hr')).toBe('/hr');
    });

    it('leaves an untranslated path alone rather than inventing a slug', () => {
      // /blog has no Croatian counterpart; it must not silently become /hr/blog.
      expect(withLocale('/blog', 'hr')).toBe('/hr/blog');
      expect(stripLocale('/hr/blog')).toEqual({ lang: 'hr', path: '/blog' });
    });

    it('round-trips with stripLocale', () => {
      for (const path of TRANSLATED_PATHS) {
        expect(stripLocale(withLocale(path, 'hr'))).toEqual({ lang: 'hr', path });
        expect(stripLocale(withLocale(path, 'en'))).toEqual({ lang: 'en', path });
      }
    });
  });

  describe('hasCounterpart', () => {
    it('is true for bilingual pages, regardless of trailing slash', () => {
      expect(hasCounterpart('/experience')).toBe(true);
      expect(hasCounterpart('/experience/')).toBe(true);
      expect(hasCounterpart('/')).toBe(true);
    });

    it('takes the ENGLISH path, which is what stripLocale hands back', () => {
      expect(hasCounterpart(stripLocale('/hr/posjet/').path)).toBe(true);
    });

    it('is false for English-only pages', () => {
      expect(hasCounterpart('/blog/')).toBe(false);
      expect(hasCounterpart('/privacy/')).toBe(false);
      expect(hasCounterpart('/what-to-do-in-split/')).toBe(false);
    });
  });

  it('TRANSLATED_PATHS matches MARKETING_ROUTES', () => {
    // These two lists must agree: one drives hreflang and the toggle, the other
    // drives which pages actually exist in Croatian.
    const fromRoutes = MARKETING_ROUTES.map((r) => (r.path ? `/${r.path}` : '/')).sort();
    expect([...TRANSLATED_PATHS].sort()).toEqual(fromRoutes);
  });
});
