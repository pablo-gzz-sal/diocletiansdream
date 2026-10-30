# Notes for src/index.html

These were HTML comments in `src/index.html`. They moved here on 2026-10-30 because comments ship in every page's source. The explanations of the inline consent script were removed for the same reason; that logic is unchanged.

Preconnect to the third-party origins the first viewport actually needs. The Vimeo trailer is the LCP element on the home page, and the DNS + TLS handshake for player.vimeo.com is otherwise paid after Angular boots.

Google Search Console site verification (carried over from the old WordPress site).

Google tag (GA4 + Google Ads)

Consent Mode v2. The consent defaults MUST be set before gtag.js runs, so this block deliberately sits above the async loader: anything below it would let the tag write ad/analytics cookies before the visitor answers the banner, which is exactly what the EU consent rules forbid. Storage is denied by default for everyone, not just the EEA — the banner is shown site-wide, so a regionless default keeps one code path. Consent is then granted (or not) by ConsentService via gtag('consent','update'). 'security_storage' stays granted: it is strictly necessary and not opt-in.

LIVE: indexing enabled at go-live (paired with environment.siteIndexable = true).

Open Graph. og:image was missing entirely, which meant every share of the home page rendered as a bare text link, and ChatGPT and Perplexity fell back to scraping arbitrary body text for a summary. PageSeoService overwrites title/description/url per route; these are the SSR defaults.

Twitter

The logo is a PNG. Declaring image/svg+xml made Chrome discard it.

## Consent script

- Consent defaults must be set before gtag.js runs, so the block sits above the async loader.
- Storage is denied by default for everyone, because the banner is site-wide. `security_storage` stays granted because it is strictly necessary.
- `wait_for_update: 500` holds tags so a returning visitor's stored consent applies before the first pageview.
- The stored decision is replayed early, because Angular starts well after the first pageview. ConsentService re-applies it after bootstrap.
- `ads_data_redaction` strips ad click identifiers while `ad_storage` is denied.
