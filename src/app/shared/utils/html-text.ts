/**
 * Turning WordPress-rendered HTML into plain text for <title>, meta tags and
 * JSON-LD.
 *
 * Pure functions with no DOM access, so they behave identically in the
 * prerenderer and the browser.
 */

/** The named entities Yoast and the WP editor actually emit. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

/**
 * Decode HTML entities in a single pass.
 *
 * Single pass is deliberate: `&amp;#039;` decodes to the literal `&#039;` and
 * stops there. Decoding repeatedly until stable would turn text that genuinely
 * contains "&amp;#039;" into an apostrophe.
 */
export function decodeEntities(text: string): string {
  return (text ?? '').replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, body: string) => {
    const token = body.toLowerCase();

    if (token.startsWith('#x')) {
      const code = parseInt(body.slice(2), 16);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    if (token.startsWith('#')) {
      const code = parseInt(body.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }

    // Unknown named entity: leave it alone rather than silently dropping text.
    return NAMED_ENTITIES[token] ?? match;
  });
}

/**
 * Strip tags, decode entities, collapse whitespace.
 *
 * Decoding happens after tag stripping so that an encoded `&lt;b&gt;` in the
 * source survives as visible text instead of being stripped as a tag.
 */
export function htmlToText(html: string): string {
  const withoutTags = (html ?? '').replace(/<[^>]*>/g, '');
  return decodeEntities(withoutTags).replace(/\s+/g, ' ').trim();
}
