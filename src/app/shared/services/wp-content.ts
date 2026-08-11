import { DOCUMENT, Inject, Injectable } from '@angular/core';

/** Attachment id -> alt text, from the WordPress media library. */
export type AltById = ReadonlyMap<number, string>;

/**
 * Rewrites WordPress `content.rendered` before it reaches [innerHTML].
 *
 * Uses the injected DOCUMENT rather than string surgery so it runs unchanged in
 * both the prerenderer (@angular/platform-server inlines domino) and the
 * browser. Removing a <section> that nests further sections is not something
 * regex can do safely.
 */
@Injectable({ providedIn: 'root' })
export class WpContentService {
  constructor(@Inject(DOCUMENT) private doc: Document) {}

  clean(html: string, altById: AltById = new Map()): string {
    if (!html) return '';

    try {
      const root = this.doc.createElement('div');
      root.innerHTML = html;

      this.dropResponsiveDuplicates(root);
      this.backfillAlt(root, altById);
      this.addImageLightboxes(root);

      return root.innerHTML;
    } catch (err) {
      // Tidying the body must never be able to lose it. The caller turns a
      // throw into "Post not found" + noindex, so without this a bad selector
      // would silently deindex all 29 posts at build time and still exit 0.
      console.error('[wp-content] clean() failed; serving the body unchanged', err);
      return html;
    }
  }

  /**
   * querySelectorAll returns a live NodeList in the browser but a bare
   * array-like under domino, which the prerenderer uses — and domino's has no
   * forEach. Copying to a real array keeps the two in step (and makes removal
   * safe, since a live list mutates as you delete from it).
   */
  private queryAll(root: HTMLElement, selector: string): Element[] {
    return Array.from(root.querySelectorAll(selector));
  }

  /**
   * Two of the posts are built as a pair of near-identical Elementor sections —
   * a mobile variant and a desktop variant — that Elementor's own stylesheet
   * would hide from each other. This app ships no Elementor CSS, so both render
   * and the article reads twice.
   *
   * Keyed on the class rather than position: the two posts carry the variants in
   * opposite order, so "drop the first section" would delete the wrong one. On
   * the other 27 posts nothing matches and this is a no-op.
   */
  private dropResponsiveDuplicates(root: HTMLElement): void {
    const mobileVariants = this.queryAll(root, '.elementor-hidden-desktop');
    if (!mobileVariants.length) return;

    for (const node of mobileVariants) {
      node.parentNode?.removeChild(node);
    }

    // The surviving desktop variant still claims to be hidden on tablet/mobile.
    // Harmless today, but it would blank the article if Elementor's stylesheet
    // ever arrived.
    for (const node of this.queryAll(root, '.elementor-hidden-tablet, .elementor-hidden-mobile')) {
      // One class per call: domino's classList does not take a rest argument.
      node.classList.remove('elementor-hidden-tablet');
      node.classList.remove('elementor-hidden-mobile');
    }
  }

  /**
   * Content images carry the attachment id as `wp-image-<id>`, but the editor
   * baked `alt=""` into the markup at insert time — later edits to the media
   * library never reach the stored post HTML. Reapply it here so the library
   * stays the single place alt text is written.
   */
  private backfillAlt(root: HTMLElement, altById: AltById): void {
    if (!altById.size) return;

    for (const img of this.queryAll(root, 'img')) {
      if (img.getAttribute('alt')?.trim()) continue;

      const id = attachmentId(img.getAttribute('class') ?? '');
      const alt = id === null ? undefined : altById.get(id);
      if (alt?.trim()) img.setAttribute('alt', alt);
    }
  }

  /**
   * WordPress body HTML is inserted through [innerHTML], so Angular cannot
   * safely bind a click handler to its images. Give each image a regular hash
   * link and a matching :target overlay instead. This works before hydration,
   * after hydration, and in static builds alike.
   */
  private addImageLightboxes(root: HTMLElement): void {
    const images = this.queryAll(root, 'img');

    images.forEach((image, index) => {
      if (image.closest('.post-image-lightbox, .post-image-lightbox-trigger')) return;

      const id = `dd-post-image-lightbox-${index + 1}`;
      const alt = image.getAttribute('alt')?.trim() ?? '';
      const source = image.getAttribute('src') ?? '';

      const trigger = this.doc.createElement('a');
      trigger.className = 'post-image-lightbox-trigger';
      trigger.setAttribute('href', `#${id}`);
      trigger.setAttribute('aria-label', alt ? `Open image: ${alt}` : 'Open image');
      image.parentNode?.insertBefore(trigger, image);
      trigger.appendChild(image);

      const overlay = this.doc.createElement('figure');
      overlay.id = id;
      overlay.className = 'post-image-lightbox';
      overlay.setAttribute('aria-label', alt || 'Image preview');

      const backdrop = this.doc.createElement('a');
      backdrop.className = 'post-image-lightbox__backdrop';
      backdrop.setAttribute('href', '#post-article');
      backdrop.setAttribute('aria-label', 'Close image');

      const preview = this.doc.createElement('img');
      preview.className = 'post-image-lightbox__image';
      preview.setAttribute('src', source);
      preview.setAttribute('alt', alt);

      const close = this.doc.createElement('a');
      close.className = 'post-image-lightbox__close';
      close.setAttribute('href', '#post-article');
      close.setAttribute('aria-label', 'Close image');
      close.textContent = '×';

      overlay.appendChild(backdrop);
      overlay.appendChild(preview);
      overlay.appendChild(close);
      root.appendChild(overlay);
    });
  }
}

/** `wp-image-666` -> 666. */
export function attachmentId(className: string): number | null {
  const match = /(?:^|\s)wp-image-(\d+)(?:\s|$)/.exec(className ?? '');
  return match ? Number(match[1]) : null;
}

/** Every attachment id referenced by an <img> in the given HTML. */
export function attachmentIdsIn(html: string): number[] {
  const ids = new Set<number>();
  for (const match of (html ?? '').matchAll(/wp-image-(\d+)/g)) {
    ids.add(Number(match[1]));
  }
  return [...ids];
}
