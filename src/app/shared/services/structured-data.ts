import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/i18n/i18n.service';
import { withLocale } from '../../core/i18n/locale-url';

/**
 * One structured-data graph for the whole site.
 *
 * Every page emits a single `@graph` whose nodes cross-reference the shared
 * Organization / LocalBusiness / WebSite entities by `@id` instead of restating
 * them. Google resolves the `@id`s across pages, so the brand is described once
 * and every page inherits it. Separate per-page schema islands (what the site
 * shipped before) give Google four unrelated businesses instead of one entity.
 *
 * Only facts verified against the live site and the i18n copy go in here.
 * Nothing is invented: no aggregateRating, no founder, and no social profile
 * that has not been confirmed to exist.
 */

const BASE = environment.siteUrl.replace(/\/+$/, '');

/** Stable node ids. Fragment-based so they are unique but resolvable site-wide. */
export const ID = {
  organization: `${BASE}/#organization`,
  website: `${BASE}/#website`,
  localBusiness: `${BASE}/#localbusiness`,
  place: `${BASE}/#place`,
  logo: `${BASE}/#logo`,
} as const;

/**
 * Profiles confirmed by the owner on 2026-08-12. These are what tie the brand
 * name to one entity across Google's graph, so every entry has to be a real,
 * live page: an unverified `sameAs` weakens entity resolution instead of
 * helping it.
 *
 * LinkedIn is deliberately absent. The company page has not been created yet —
 * add it here and to the footer once it exists.
 */
const SAME_AS = [
  'https://www.instagram.com/diocletiansdream/',
  'https://www.facebook.com/diocletiansdream/',
  'https://www.tiktok.com/@diocletiansdream',
  'https://www.youtube.com/@diocletiansdream',
  'https://www.tripadvisor.com/Attraction_Review-g295370-d20921353-Reviews-Diocletians_Dream-Split_Split_Dalmatia_County_Dalmatia.html',
];

/**
 * The two owners, as named in the site's own founding-story post. No `sameAs`
 * until someone confirms a canonical profile for each: an unverifiable link is
 * worse than none, because it asserts an identity Google cannot corroborate.
 */
const FOUNDERS = [
  { '@type': 'Person', name: "Declan O'Rourke" },
  { '@type': 'Person', name: 'Tomo Taraš' },
] as const;

const POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Zagrebačka ul. 1',
  addressLocality: 'Split',
  addressRegion: 'Split-Dalmatia County',
  postalCode: '21000',
  addressCountry: 'HR',
} as const;

const GEO = {
  '@type': 'GeoCoordinates',
  latitude: 43.5103,
  longitude: 16.4412,
} as const;

/**
 * Seasonal hours, from the schedule published on the Visit page. Separate
 * OpeningHoursSpecification blocks with validFrom/validThrough, because a single
 * block would tell Google the winter hours apply in August.
 *
 * May is deliberately absent. The published schedule lists it twice ("April –
 * May" at 10:00–18:00 and "May – October" at 10:00–20:00), so asserting either
 * one would put a claim in Google's index that the site itself contradicts.
 * Add the May block here once the real May hours are confirmed.
 */
const OPENING_HOURS = [
  { opens: '11:00', closes: '16:00', validFrom: '--11-01', validThrough: '--03-31' },
  { opens: '10:00', closes: '18:00', validFrom: '--04-01', validThrough: '--04-30' },
  { opens: '10:00', closes: '20:00', validFrom: '--06-01', validThrough: '--10-31' },
].map((h) => ({
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  ...h,
}));

/** Ticket prices as shown in the hero conversion strip. */
export const TICKET_PRICES = { adult: 13, child: 9, currency: 'EUR' } as const;

export interface FaqEntry {
  q: string;
  a: string;
}

export interface BreadcrumbEntry {
  name: string;
  /** Locale-aware absolute URL. */
  url: string;
}

@Injectable({ providedIn: 'root' })
export class StructuredDataService {
  private translate = inject(TranslateService);
  private i18n = inject(I18nService);

  /** Absolute, trailing-slashed URL for an English path in the active locale. */
  url(pathEn: string): string {
    const path = withLocale(pathEn, this.i18n.current());
    return `${BASE}${path.endsWith('/') ? path : `${path}/`}`;
  }

  asset(path: string): string {
    return `${BASE}/${path.replace(/^\/+/, '')}`;
  }

  private get lang(): string {
    return this.i18n.current() === 'hr' ? 'hr-HR' : 'en-US';
  }

  // ── Shared entities ──────────────────────────────────────────────

  organization() {
    return {
      '@type': 'Organization',
      '@id': ID.organization,
      name: "Diocletian's Dream",
      alternateName: "Diocletian's Dream VR Museum",
      url: `${BASE}/`,
      logo: {
        '@type': 'ImageObject',
        '@id': ID.logo,
        url: this.asset('assets/images/ddLogo.png'),
        contentUrl: this.asset('assets/images/ddLogo.png'),
        caption: "Diocletian's Dream",
      },
      image: { '@id': ID.logo },
      foundingDate: '2020',
      // Named, not invented: both owners are identified by name in the site's
      // own published account of how the project started
      // (/from-an-idea-to-the-realization-how-did-the-story-of-diocletians-dream-begin/).
      // A brand with real people attached resolves as an entity; an anonymous
      // one does not, and `founder` is the field Google reads for that.
      founder: FOUNDERS,
      email: 'contact@diocletiansdream.com',
      telephone: '+385 21 886 015',
      address: POSTAL_ADDRESS,
      sameAs: SAME_AS,
    };
  }

  website() {
    return {
      '@type': 'WebSite',
      '@id': ID.website,
      url: `${BASE}/`,
      name: "Diocletian's Dream",
      publisher: { '@id': ID.organization },
      inLanguage: this.lang,
    };
  }

  /**
   * The venue itself. Typed as both LocalBusiness and TouristAttraction so it is
   * eligible for the attraction treatment in Search and Maps while still
   * carrying the opening hours and contact data of a business listing.
   */
  localBusiness(description: string) {
    return {
      '@type': ['LocalBusiness', 'TouristAttraction'],
      '@id': ID.localBusiness,
      name: "Diocletian's Dream",
      alternateName: "Diocletian's Dream VR Museum",
      description,
      url: `${BASE}/`,
      telephone: '+385 21 886 015',
      email: 'contact@diocletiansdream.com',
      image: this.asset('assets/images/vr/peristyle-crowd.jpg'),
      logo: { '@id': ID.logo },
      address: POSTAL_ADDRESS,
      geo: GEO,
      hasMap: 'https://maps.app.goo.gl/ypBTY6gDES6HWmPE6',
      openingHoursSpecification: OPENING_HOURS,
      currenciesAccepted: 'EUR',
      publicAccess: true,
      isAccessibleForFree: false,
      smokingAllowed: false,
      parentOrganization: { '@id': ID.organization },
      touristType: ['Families', 'School groups', 'Cultural tourists', 'Couples'],
      availableLanguage: [
        'English',
        'German',
        'Italian',
        'French',
        'Croatian',
        'Spanish',
        'Portuguese',
        'Polish',
      ],
      amenityFeature: [
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Wheelchair accessible',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Indoor venue',
          value: true,
        },
      ],
      /** The palace itself, so Google links the venue to the UNESCO entity. */
      containedInPlace: {
        '@type': 'LandmarksOrHistoricalBuildings',
        '@id': ID.place,
        name: "Diocletian's Palace",
        sameAs: [
          'https://en.wikipedia.org/wiki/Diocletian%27s_Palace',
          'https://www.wikidata.org/wiki/Q1145885',
          'https://whc.unesco.org/en/list/97/',
        ],
        address: POSTAL_ADDRESS,
      },
      makesOffer: this.ticketOffers(),
      sameAs: SAME_AS,
    };
  }

  // ── Per-page nodes ───────────────────────────────────────────────

  /**
   * @param type e.g. 'WebPage', 'AboutPage', 'ContactPage', 'CollectionPage'
   * @param speakableSelectors CSS selectors for the passages a voice assistant
   *        should read out. Google reads these; most SEO plugins never emit them.
   */
  webPage(opts: {
    type?: string;
    url: string;
    name: string;
    description: string;
    primaryImage?: string;
    breadcrumbId?: string;
    speakableSelectors?: string[];
    datePublished?: string;
    dateModified?: string;
  }) {
    const node: Record<string, unknown> = {
      '@type': opts.type ?? 'WebPage',
      '@id': `${opts.url}#webpage`,
      url: opts.url,
      name: opts.name,
      description: opts.description,
      isPartOf: { '@id': ID.website },
      about: { '@id': ID.localBusiness },
      inLanguage: this.lang,
      potentialAction: {
        '@type': 'ReadAction',
        target: [opts.url],
      },
    };

    if (opts.primaryImage) {
      node['primaryImageOfPage'] = {
        '@type': 'ImageObject',
        url: opts.primaryImage,
        contentUrl: opts.primaryImage,
      };
    }
    if (opts.breadcrumbId) node['breadcrumb'] = { '@id': opts.breadcrumbId };
    if (opts.datePublished) node['datePublished'] = opts.datePublished;
    if (opts.dateModified) node['dateModified'] = opts.dateModified;
    if (opts.speakableSelectors?.length) {
      node['speakable'] = {
        '@type': 'SpeakableSpecification',
        cssSelector: opts.speakableSelectors,
      };
    }

    return node;
  }

  breadcrumb(pageUrl: string, trail: BreadcrumbEntry[]) {
    return {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: trail.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: entry.name,
        item: entry.url,
      })),
    };
  }

  /** Home breadcrumb entry, translated and locale-aware. */
  homeCrumb(): BreadcrumbEntry {
    return { name: this.translate.instant('header.nav.home'), url: this.url('/') };
  }

  /**
   * FAQPage built from the same localized items the page renders.
   *
   * FAQ rich results are whitelisted to government and health sites since
   * August 2023, so this earns no stars in a normal SERP. It stays because AI
   * Overviews, ChatGPT and Perplexity all read FAQPage when deciding what to
   * quote, and that is where the traffic is going.
   */
  faqPage(pageUrl: string, items: FaqEntry[]) {
    return {
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      inLanguage: this.lang,
      isPartOf: { '@id': `${pageUrl}#webpage` },
      mainEntity: items
        .filter((item) => !!item?.q && !!item?.a)
        .map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
    };
  }

  /** Adult and child tickets, priced as shown on the site. */
  ticketOffers() {
    const validThrough = `${new Date().getUTCFullYear() + 1}-12-31`;
    const base = {
      '@type': 'Offer',
      priceCurrency: TICKET_PRICES.currency,
      availability: 'https://schema.org/InStock',
      url: this.url('/booking'),
      validThrough,
    };
    return [
      { ...base, name: 'Adult ticket', price: String(TICKET_PRICES.adult) },
      {
        ...base,
        name: 'Child ticket (ages 8 to 14)',
        price: String(TICKET_PRICES.child),
        eligibleCustomerType: 'https://schema.org/Child',
      },
    ];
  }

  /**
   * The VR session as a bookable product. `Product` + `Offer` is what surfaces
   * price in Search and what LLMs read when a visitor asks what a ticket costs.
   */
  ticketProduct(opts: { url: string; name: string; description: string; image: string }) {
    return {
      '@type': ['Product', 'TouristAttraction'],
      '@id': `${opts.url}#ticket`,
      name: opts.name,
      description: opts.description,
      image: opts.image,
      brand: { '@id': ID.organization },
      category: 'Virtual reality museum experience',
      audience: {
        '@type': 'PeopleAudience',
        suggestedMinAge: 8,
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: TICKET_PRICES.currency,
        lowPrice: String(TICKET_PRICES.child),
        highPrice: String(TICKET_PRICES.adult),
        offerCount: 2,
        availability: 'https://schema.org/InStock',
        url: this.url('/booking'),
        offers: this.ticketOffers(),
      },
    };
  }

  /**
   * Assemble a page graph. Falsy nodes are dropped so callers can build the list
   * conditionally without filtering at every call site.
   */
  graph(nodes: Array<unknown | null | undefined>) {
    return {
      '@context': 'https://schema.org',
      '@graph': nodes.filter(Boolean),
    };
  }
}
