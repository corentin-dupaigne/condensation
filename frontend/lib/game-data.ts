import type {
  HeroSlide,
  Game,
  BestsellerGame,
  DealTier,
  Platform,
  RelatedGame,
} from "./types";

import {
  fetchFeaturedData,
  rawToGame,
  centsToPrice,
  slugify,
} from "./steam-api";

/* ── Hero Slides ── */

const heroGradients = [
  { from: "#0f2027", to: "#203a43" },
  { from: "#1a0033", to: "#330066" },
  { from: "#1c1c00", to: "#3a3a00" },
  { from: "#0a1628", to: "#162844" },
  { from: "#1a0000", to: "#330011" },
];

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const rawData = await fetchFeaturedData();
  return rawData.specials.items.slice(0, 5).map((item, i) => ({
    id: String(item.id),
    title: item.name,
    subtitle: `Save ${item.discount_percent}% on ${item.name}. Limited time offer — grab your key before the deal expires!`,
    ctaText: "Buy Now",
    ctaLink: `/games/${slugify(item.name)}`,
    price: centsToPrice(item.final_price),
    gradientFrom: heroGradients[i % heroGradients.length].from,
    gradientTo: heroGradients[i % heroGradients.length].to,
    image: item.header_image,
  }));
}

/* ── Recommended games ── */

export async function getRecommendedGames(): Promise<Game[]> {
  const rawData = await fetchFeaturedData();
  return rawData.specials.items.map(rawToGame);
}

/* ── Bestsellers ── */

export async function getBestsellerGames(): Promise<BestsellerGame[]> {
  const rawData = await fetchFeaturedData();
  return rawData.top_sellers.items
    .slice(0, 10)
    .map((item, i) => ({ ...rawToGame(item, i), rank: i + 1 }))
    .filter((game) => game.price < 150)
    .slice(0, 5);
}

/* ── New Releases ── */

export async function getNewReleases(): Promise<Game[]> {
  const rawData = await fetchFeaturedData();
  return rawData.new_releases.items.slice(0, 6).map((item, i) => ({
    ...rawToGame(item, i),
    badges: ["new" as const],
    releasedAgo: "Just Released",
  }));
}

/* ── Pre-orders ── */

export async function getPreOrders(): Promise<Game[]> {
  const rawData = await fetchFeaturedData();
  return rawData.coming_soon.items.slice(0, 6).map((item, i) => ({
    ...rawToGame(item, i),
    badges: ["pre-order" as const],
    timeLeft: item.discount_expiration
      ? `${Math.max(1, Math.ceil((item.discount_expiration * 1000 - Date.now()) / 86400000))} Days Left`
      : "Coming Soon",
  }));
}

/* ── Budget Deals ── */

function buildDealTier(
  label: string,
  maxCents: number,
  items: Awaited<ReturnType<typeof fetchFeaturedData>>["specials"]["items"]
): DealTier {
  return {
    label,
    maxPrice: maxCents / 100,
    games: items
      .filter(
        (it) => it.final_price > 0 && it.final_price <= maxCents && it.discounted
      )
      .slice(0, 6)
      .map((it, i) => ({ ...rawToGame(it, i), badges: ["discount" as const] })),
  };
}

export async function getDealTiers(): Promise<DealTier[]> {
  const rawData = await fetchFeaturedData();
  const allDiscounted = [
    ...rawData.specials.items,
    ...rawData.new_releases.items,
    ...rawData.top_sellers.items,
  ].filter((it) => it.discounted && it.final_price > 0);

  return [
    buildDealTier("Under $5", 500, allDiscounted),
    buildDealTier("Under $10", 1000, allDiscounted),
    buildDealTier("Under $20", 2000, allDiscounted),
    buildDealTier("Under $50", 5000, allDiscounted),
  ];
}

/* ── Catalog ── */

export async function getCatalogGames(): Promise<Game[]> {
  const rawData = await fetchFeaturedData();
  const all = [
    ...rawData.specials.items,
    ...rawData.top_sellers.items,
    ...rawData.new_releases.items,
    ...rawData.coming_soon.items,
  ];
  const seen = new Set<number>();
  return all
    .filter((it) => {
      if (seen.has(it.id)) return false;
      seen.add(it.id);
      return true;
    })
    .map(rawToGame);
}

/* ── Game by slug ── */

export async function getGameBySlug(
  slug: string
): Promise<{ game: Game; steamAppId: number } | undefined> {
  const rawData = await fetchFeaturedData();
  const all = [
    ...rawData.specials.items,
    ...rawData.top_sellers.items,
    ...rawData.new_releases.items,
    ...rawData.coming_soon.items,
  ];
  const seen = new Set<number>();
  const unique = all.filter((it) => {
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });
  const found = unique.find((it) => slugify(it.name) === slug);
  if (!found) return undefined;
  return { game: rawToGame(found, 0), steamAppId: found.id };
}

/* ── Related games ── */

export async function getRelatedGames(): Promise<RelatedGame[]> {
  const rawData = await fetchFeaturedData();
  return rawData.specials.items.slice(0, 4).map((item, i) => ({
    ...rawToGame(item, i),
    genreBadge: ["RPG", "ACTION", "SHOOTER", "ADVENTURE"][i % 4],
  }));
}

/* ── Deals Page ── */

export interface DealsPageData {
  flashDeals: Game[];
  weeklyDeals: Game[];
  clearanceDeals: Game[];
  flashDealsExpiry: string;
}

export async function getDealsPageData(): Promise<DealsPageData> {
  const rawData = await fetchFeaturedData();

  const specials = rawData.specials.items.filter(
    (it) => it.discounted && it.final_price > 0
  );
  const topSellers = rawData.top_sellers.items.filter(
    (it) => it.discounted && it.final_price > 0
  );

  // Flash deals: highest discount specials
  const flashDeals = [...specials]
    .sort((a, b) => b.discount_percent - a.discount_percent)
    .slice(0, 6)
    .map((it, i) => ({
      ...rawToGame(it, i),
      badges: ["discount" as const],
    }));

  // Weekly deals: top sellers that are discounted
  const weeklyDeals = topSellers.slice(0, 8).map((it, i) => ({
    ...rawToGame(it, i),
    badges: ["discount" as const, "popular" as const],
  }));

  // Clearance: cheapest discounted games
  const clearanceDeals = [...specials, ...topSellers]
    .filter((it) => it.final_price <= 1000)
    .sort((a, b) => a.final_price - b.final_price)
    .slice(0, 12)
    .map((it, i) => ({
      ...rawToGame(it, i),
      badges: ["discount" as const],
    }));

  // Flash deal expiry: use first item's discount_expiration or fallback to 24h from now
  const firstExpiry = specials[0]?.discount_expiration;
  const flashDealsExpiry = firstExpiry
    ? new Date(firstExpiry * 1000).toISOString()
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return { flashDeals, weeklyDeals, clearanceDeals, flashDealsExpiry };
}

/* ── Static UI constants ── */

export const genres = [
  "All Genres",
  "Action",
  "RPG",
  "Strategy",
  "Indie",
  "Simulation",
  "Racing",
  "VR Only",
  "Free to Play",
];

export const allPlatforms: { value: Platform; label: string }[] = [
  { value: "windows", label: "Windows" },
  { value: "mac", label: "macOS" },
  { value: "linux", label: "Linux" },
];

export const allGenres: string[] = [
  "Action",
  "RPG",
  "Strategy",
  "Indie",
  "Simulation",
  "Racing",
  "Sports",
  "Adventure",
  "Shooter",
  "Puzzle",
  "Horror",
  "Platformer",
  "Survival",
  "Sandbox",
  "Fighting",
];

export const popularSearches: string[] = [
  "ELDEN RING",
  "Cyberpunk 2077",
  "Baldur's Gate 3",
  "Red Dead Redemption 2",
  "Crimson Desert",
  "Slay the Spire 2",
];
