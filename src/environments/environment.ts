export const environment = {
  production: false,
  // WordPress (headless CMS) now lives on its own subdomain on SiteGround, so
  // the Angular app can own the root domain. Update this if the CMS host moves.
  wpBaseUrl: 'https://cms.diocletiansdream.com',
  siteUrl: 'https://diocletiansdream.com',
  // LAUNCH FLAG: `true` at go-live so pages emit
  // <meta name="robots" content="index, follow"> and are eligible for indexing.
  // (Paired with the static default in src/index.html.)
  siteIndexable: true,
};
