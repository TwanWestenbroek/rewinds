/**
 * The regex patterns for different ticket platforms
 */
const RegexPatterns = {
  WEEZTIX: /^.*\/weeztix.*$/i,
  EVENTIX: /^.*\/eventix.*$/i,
  MIJNETICKETS: /^.*\/mijnetickets.*$/i,
  SHOP_WEEZTIX: /^https?:\/\/shop\.weeztix\.com\/.*$/i,
};

/**
 * The scraper config for the organisations
 */
const SCRAPER_CONFIG: Record<
  Organisation,
  { url: string; pattern: RegExp | RegExp[]; headless?: boolean }
> = {
  DIEKA: {
    url: "https://dieka.nl/agenda",
    pattern: RegexPatterns.MIJNETICKETS,
  },
  JOY: {
    url: "https://joy-events.nl/agenda/",
    pattern: [RegexPatterns.WEEZTIX, RegexPatterns.EVENTIX],
  },
  THUISHAVEN: {
    url: "https://thuishaven.nl/#agenda",
    pattern: /^https:\/\/thuishaven\.nl\/\d{1,2}-[a-z]+-.*$/i,
  },
  ABSOLUTELY_FRESH: {
    url: "https://www.absolutelyfresh.nl/events",
    pattern: /^https:\/\/www\.absolutelyfresh\.nl\/events\/[^\/]+\/?$/i,
  },
  BOODE: {
    url: "https://www.boode.nl/boode-op-zn-kop/",
    pattern: [
      RegexPatterns.MIJNETICKETS,
      /^https:\/\/www\.dancenight\.nl\/tickets-bestellen\/.*$/i,
    ],
  },
  SUNCHASERS: {
    url: "https://www.sunchasers.community/",
    pattern: [
      RegexPatterns.SHOP_WEEZTIX,
      /^https?:\/\/(?:www\.)?sunchasers\.community\/events\/[a-z0-9\-]+$/i,
    ],
    headless: false,
  },
  PARADISO: {
    url: "https://www.paradiso.nl/",
    pattern: /^.*\/programma.*$/i,
  },
};

/**
 * The organisation map for the organisations
 */
const ORGANISATION_MAP: Record<
  Organisation,
  { slug: string; name: string; url: string }
> = {
  DIEKA: { slug: "dieka", name: "Dieka", url: "https://dieka.nl/" },
  JOY: { slug: "joy", name: "Joy", url: "https://joy-events.nl/" },
  THUISHAVEN: {
    slug: "thuishaven",
    name: "Thuishaven",
    url: "https://thuishaven.nl/",
  },
  ABSOLUTELY_FRESH: {
    slug: "absolutely-fresh",
    name: "Absolutely Fresh",
    url: "https://www.absolutelyfresh.nl/",
  },
  BOODE: {
    slug: "boode",
    name: "Boode",
    url: "https://www.boode.nl/",
  },
  SUNCHASERS: {
    slug: "sunchasers",
    name: "Sunchasers",
    url: "https://www.sunchasers.community/",
  },
  PARADISO: {
    slug: "paradiso",
    name: "Paradiso",
    url: "https://www.paradiso.nl/",
  },
};

/**
 * The organisations to scrape
 */
const Organisation = [
  "DIEKA",
  "JOY",
  "THUISHAVEN",
  "ABSOLUTELY_FRESH",
  "BOODE",
  "SUNCHASERS",
  "PARADISO",
] as const;

/**
 * The type of the organisations
 */
type Organisation = (typeof Organisation)[number];

export { SCRAPER_CONFIG, ORGANISATION_MAP, Organisation };
