import { decodeEntities, htmlToText } from './html-text';

describe('decodeEntities', () => {
  it('decodes the numeric apostrophe Yoast emits', () => {
    expect(decodeEntities('Diocletian&#039;s Dream')).toBe("Diocletian's Dream");
  });

  it('decodes hex and named entities', () => {
    expect(decodeEntities('&#x27;')).toBe("'");
    expect(decodeEntities('Tom &amp; Jerry &ndash; a &quot;classic&quot;')).toBe(
      'Tom & Jerry – a "classic"',
    );
  });

  it('decodes only once, so an escaped entity stays escaped', () => {
    // The bug this guards: decoding until stable would turn text that really
    // says "&amp;#039;" into an apostrophe.
    expect(decodeEntities('&amp;#039;')).toBe('&#039;');
  });

  it('decodes &nbsp; to a real non-breaking space', () => {
    expect(decodeEntities('Cruise&nbsp;Visitors')).toBe('Cruise Visitors');
  });

  it('leaves unknown entities alone rather than dropping them', () => {
    expect(decodeEntities('&notarealentity; &#zz;')).toBe('&notarealentity; &#zz;');
  });

  it('handles null/undefined input', () => {
    expect(decodeEntities(undefined as unknown as string)).toBe('');
  });
});

describe('htmlToText', () => {
  it('strips tags, decodes entities and collapses whitespace', () => {
    expect(htmlToText('<p>Who was   Diocletian&#039;s\nheir?</p>')).toBe(
      "Who was Diocletian's heir?",
    );
  });

  it('keeps encoded markup as visible text', () => {
    // Decoding after stripping is what preserves this: decode first and the
    // <b> would be stripped as a tag.
    expect(htmlToText('use &lt;b&gt; for bold')).toBe('use <b> for bold');
  });
});
