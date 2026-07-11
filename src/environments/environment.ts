export const environment = {
  production: false,
  wpBaseUrl: 'https://diocletiansdream.com',
  siteUrl: 'https://diocletiansdream.com',
  // LAUNCH FLAG: keep `false` while the site is pre-launch so every page emits
  // <meta name="robots" content="noindex, nofollow">. Flip to `true` on go-live
  // (and update the static default in src/index.html) to allow indexing.
  siteIndexable: false,
};
