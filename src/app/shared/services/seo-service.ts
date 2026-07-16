import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { withLocale } from '../../core/i18n/locale-url';

/**
 * Ensure page URLs end with a trailing slash (the site's canonical form),
 * matching the old WordPress permalinks. Files (a dot in the last segment)
 * and URLs carrying a query/fragment are left untouched.
 */
export function withTrailingSlash(url: string): string {
  if (!url) return url;
  const hashIndex = url.search(/[?#]/);
  const path = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const rest = hashIndex === -1 ? '' : url.slice(hashIndex);
  const lastSegment = path.split('/').pop() ?? '';
  if (path.endsWith('/') || lastSegment.includes('.')) return url;
  return `${path}/${rest}`;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private renderer: Renderer2;

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setTitle(value: string) {
    this.title.setTitle(value);
  }

  setDescription(value: string) {
    this.meta.updateTag({ name: 'description', content: value });
  }

  /**
   * Emit robots directive based on the launch flag. Pre-launch the whole site
   * is noindex,nofollow; on launch flip environment.siteIndexable to true.
   * Pass `forceNoindex` for pages that must never be indexed (e.g. 404).
   */
  setRobots(forceNoindex = false) {
    const content =
      environment.siteIndexable && !forceNoindex ? 'index, follow' : 'noindex, nofollow';
    this.meta.updateTag({ name: 'robots', content });
  }

  setCanonical(url: string) {
    const href = withTrailingSlash(url);
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.renderer.createElement('link');
      link?.setAttribute('rel', 'canonical');
      this.renderer.appendChild(this.doc.head, link);
    }
    link?.setAttribute('href', href);
  }

  /**
   * Marks the SSR response so the Node server can promote it to the given HTTP
   * status (used for real 404s on unknown routes). Renders a small meta tag the
   * Express handler looks for; harmless in the browser.
   */
  setHttpStatus(code: number) {
    this.meta.updateTag({ name: 'ssr-status-code', content: String(code) });
  }

  clearHttpStatus() {
    this.meta.removeTag('name="ssr-status-code"');
  }

  /**
   * Reciprocal hreflang set for a page that exists in both locales. Google
   * ignores one-way annotations, so both members of a pair must emit the same
   * three tags. Pass the ENGLISH path — both sides are derived from it.
   */
  setLocaleAlternates(pathEn: string) {
    const base = environment.siteUrl.replace(/\/+$/, '');
    const en = `${base}${withLocale(pathEn, 'en')}`;
    const hr = `${base}${withLocale(pathEn, 'hr')}`;
    this.setAlternates([
      { hreflang: 'en', href: en },
      { hreflang: 'hr', href: hr },
      { hreflang: 'x-default', href: en },
    ]);
  }

  setAlternates(alts: Array<{ hreflang: string; href: string }>) {
    this.clearAlternates();
    for (const alt of alts) {
      const link = this.renderer.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', alt.hreflang);
      link.setAttribute('href', withTrailingSlash(alt.href));
      this.renderer.appendChild(this.doc.head, link);
    }
  }

  /**
   * English-only pages (blog, posts, legal, 404) must call this: <link> tags
   * survive client-side navigation, so alternates from a previous page would
   * otherwise leak onto a page that has no Croatian counterpart.
   */
  clearAlternates() {
    this.doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  }

  setOpenGraph(tags: {
    url?: string;
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    locale?: string;
  }) {
    if (tags.title) this.meta.updateTag({ property: 'og:title', content: tags.title });
    if (tags.description) this.meta.updateTag({ property: 'og:description', content: tags.description });
    if (tags.url) this.meta.updateTag({ property: 'og:url', content: withTrailingSlash(tags.url) });
    if (tags.image) this.meta.updateTag({ property: 'og:image', content: tags.image });
    if (tags.locale) this.meta.updateTag({ property: 'og:locale', content: tags.locale });
    this.meta.updateTag({ property: 'og:type', content: tags.type ?? 'article' });

    // Twitter (basic)
    if (tags.title) this.meta.updateTag({ name: 'twitter:title', content: tags.title });
    if (tags.description) this.meta.updateTag({ name: 'twitter:description', content: tags.description });
    if (tags.image) this.meta.updateTag({ name: 'twitter:image', content: tags.image });
    this.meta.updateTag({ name: 'twitter:card', content: tags.image ? 'summary_large_image' : 'summary' });
  }

  setJsonLd(id: string, data: unknown) {
    // Remove existing script with same id
    const existing = this.doc.getElementById(id);
    if (existing) existing.remove();

    const script = this.renderer.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.renderer.appendChild(this.doc.head, script);
  }

  clearJsonLd(id: string) {
    const existing = this.doc.getElementById(id);
    if (existing) existing.remove();
  }
}