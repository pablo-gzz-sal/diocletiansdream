import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

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

  setCanonical(url: string) {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.renderer.createElement('link');
      link?.setAttribute('rel', 'canonical');
      this.renderer.appendChild(this.doc.head, link);
    }
    link?.setAttribute('href', url);
  }

  setOpenGraph(tags: {
    url?: string;
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  }) {
    if (tags.title) this.meta.updateTag({ property: 'og:title', content: tags.title });
    if (tags.description) this.meta.updateTag({ property: 'og:description', content: tags.description });
    if (tags.url) this.meta.updateTag({ property: 'og:url', content: tags.url });
    if (tags.image) this.meta.updateTag({ property: 'og:image', content: tags.image });
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