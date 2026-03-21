import {
  type HeroSlide,
  type Game,
  type BestsellerGame,
  type DealTier,
  type Platform,
  type GameDetail,
  type DeluxePerk,
  type DLCItem,
  type Achievement,
  type RelatedGame,
  type SearchResultGame,
  type RecentlyViewedGame,
} from "./types";

/* ── helpers ── */

interface RawItem {
  id: number;
  name: string;
  discounted: boolean;
  discount_percent: number;
  original_price: number | null;
  final_price: number;
  currency: string;
  large_capsule_image: string;
  small_capsule_image: string;
  header_image: string;
  windows_available: boolean;
  mac_available: boolean;
  linux_available: boolean;
  controller_support?: string;
  discount_expiration?: number;
}

interface RawFeaturedData {
  specials: { items: RawItem[] };
  top_sellers: { items: RawItem[] };
  new_releases: { items: RawItem[] };
  coming_soon: { items: RawItem[] };
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function centsToPrice(cents: number | null): number {
  if (cents == null || cents === 0) return 0;
  return cents / 100;
}

function detectPlatform(_item: RawItem): Platform {
  return "steam";
}

function rawToGame(item: RawItem, index: number): Game {
  const price = centsToPrice(item.final_price);
  const originalPrice = item.discounted
    ? centsToPrice(item.original_price)
    : undefined;
  const discountPercent = item.discounted ? item.discount_percent : undefined;

  const badges: Game["badges"] = [];
  if (item.discounted && item.discount_percent > 0) badges.push("discount");

  return {
    id: `${item.id}-${index}`,
    title: item.name,
    slug: slugify(item.name),
    platform: detectPlatform(item),
    genres: [],
    price,
    originalPrice,
    discountPercent,
    badges,
    image: item.large_capsule_image,
    headerImage: item.header_image,
  };
}

/* ── In-memory cache for featured data ── */

let cachedFeaturedData: RawFeaturedData | null = null;

async function fetchFeaturedData(): Promise<RawFeaturedData> {
  if (cachedFeaturedData) return cachedFeaturedData;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/steam/featured`, {
    next: { revalidate: 3600 },
  });
  cachedFeaturedData = await res.json();
  return cachedFeaturedData as RawFeaturedData;
}

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

/* ── Specials → Recommended games ── */

export async function getRecommendedGames(): Promise<Game[]> {
  const rawData = await fetchFeaturedData();
  return rawData.specials.items.map(rawToGame);
}

/* ── Top Sellers → Bestsellers ── */

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

/* ── Coming Soon → Pre-orders ── */

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
  items: RawItem[]
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
  const allDiscountedItems = [
    ...rawData.specials.items,
    ...rawData.new_releases.items,
    ...rawData.top_sellers.items,
  ].filter((it) => it.discounted && it.final_price > 0);
  return [
    buildDealTier("Under $5", 500, allDiscountedItems),
    buildDealTier("Under $10", 1000, allDiscountedItems),
    buildDealTier("Under $20", 2000, allDiscountedItems),
    buildDealTier("Under $50", 5000, allDiscountedItems),
  ];
}

/* ── Catalog ── */

export async function getCatalogGames(): Promise<Game[]> {
  const rawData = await fetchFeaturedData();
  const allRawItems = [
    ...rawData.specials.items,
    ...rawData.top_sellers.items,
    ...rawData.new_releases.items,
    ...rawData.coming_soon.items,
  ];
  const seenIds = new Set<number>();
  return allRawItems
    .filter((it) => {
      if (seenIds.has(it.id)) return false;
      seenIds.add(it.id);
      return true;
    })
    .map(rawToGame);
}

/* ── Look up a game by slug ── */

export async function getGameBySlug(
  slug: string
): Promise<{ game: Game; steamAppId: number } | undefined> {
  const rawData = await fetchFeaturedData();
  const allRawItems = [
    ...rawData.specials.items,
    ...rawData.top_sellers.items,
    ...rawData.new_releases.items,
    ...rawData.coming_soon.items,
  ];
  const seenIds = new Set<number>();
  const unique = allRawItems.filter((it) => {
    if (seenIds.has(it.id)) return false;
    seenIds.add(it.id);
    return true;
  });
  const found = unique.find((it) => slugify(it.name) === slug);
  if (!found) return undefined;
  return { game: rawToGame(found, 0), steamAppId: found.id };
}

/* ── Genres / UI constants (static) ── */

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
  { value: "steam", label: "Steam" },
  { value: "epic", label: "Epic Games" },
  { value: "xbox", label: "Xbox" },
  { value: "playstation", label: "PlayStation" },
  { value: "switch", label: "Nintendo Switch" },
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

/* ── Product Detail: static placeholder data ── */

export const cyberStellarDetail: GameDetail = {
  id: "pd1",
  title: "Cyber Stellar 2088",
  slug: "cyber-stellar-2088",
  platform: "steam",
  genres: ["Action", "RPG", "Sci-Fi"],
  price: 44.99,
  badges: [],
  description: [
    "In a world where memories are traded like currency and the sky is a permanent canvas of corporate advertising, one mercenary will trigger the collapse of the ultimate data vault.",
    "Cyber Stellar 2088 is the definitive open-world RPG experience. Explore the sprawling megacity of Stellaris, from its rain-slicked neon spires to its crumbling subterranean slums. Customise your cybernetic enhancements, build your reputation among rival factions, and make choices that will ripple through the city's power structures.",
  ],
  developer: "Nebula Interactive",
  publisher: "Condensation Corp",
  releaseDate: "August 22, 2088",
  features: ["WORLD PLAYER", "ACHIEVEMENTS", "CONTROLLER SUPPORT", "CLOUD SAVES"],
  languages: [
    { language: "English", interface: true, audio: true, subtitles: true },
    { language: "Japanese", interface: true, audio: true, subtitles: true },
    { language: "German", interface: true, audio: false, subtitles: true },
  ],
  metaScore: 88,
  recommendedPercent: 94,
  ageRating: "M 17+",
  editionStandardPrice: 44.99,
  editionDeluxePrice: 79.99,
  systemRequirements: {
    minimum: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i5-4992 / Ryzen 5 1600",
      memory: "12 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 6GB",
      storage: "70 GB SSD",
    },
    recommended: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i7-9700 / Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 3070 8GB",
      storage: "70 GB SSD",
    },
  },
};

export const deluxePerks: DeluxePerk[] = [
  { icon: "confirmation_number", title: "Season Pass", description: "Access to all three upcoming story expansions." },
  { icon: "shield", title: "Onyx Armor Set", description: "Exclusive high-spec tactical gear for early game." },
  { icon: "music_note", title: "Hi-Res Soundtrack", description: "45 tracks of heavy synth-wave excellence." },
  { icon: "photo_camera", title: "Artbook PDF", description: "200 pages of concept art and world-building." },
];

export const dlcItems: DLCItem[] = [
  { id: "dlc1", title: "Neon Shadows Expansion", price: 14.99 },
  { id: "dlc2", title: "Chrome Vehicle Pack", price: 9.99 },
];

export const achievements: Achievement[] = [
  { id: "a1", title: "First Steps", icon: "directions_walk", unlocked: true },
  { id: "a2", title: "Hacker Elite", icon: "terminal", unlocked: true },
  { id: "a3", title: "Ghost Runner", icon: "sprint", unlocked: true },
  { id: "a4", title: "Data Vault", icon: "folder_special", unlocked: true },
  { id: "a5", title: "Neon Master", icon: "auto_awesome", unlocked: false },
  { id: "a6", title: "Lock Picker", icon: "lock_open", unlocked: false },
  { id: "a7", title: "Cyber Medic", icon: "healing", unlocked: false },
  { id: "a8", title: "Sharp Shooter", icon: "gps_fixed", unlocked: false },
  { id: "a9", title: "Explorer", icon: "explore", unlocked: false },
  { id: "a10", title: "Endgame", icon: "emoji_events", unlocked: true },
];

/* ── Search / Recently Viewed ── */

export const popularSearches: string[] = [
  "ELDEN RING",
  "Cyberpunk 2077",
  "Baldur's Gate 3",
  "Red Dead Redemption 2",
  "Crimson Desert",
  "Slay the Spire 2",
];

export async function getSearchResultGames(): Promise<SearchResultGame[]> {
  const rawData = await fetchFeaturedData();
  return rawData.top_sellers.items.slice(0, 4).map((item) => ({
    id: String(item.id),
    title: item.name,
    slug: slugify(item.name),
    platforms: [
      item.windows_available ? "PC" : "",
      item.mac_available ? "Mac" : "",
      item.linux_available ? "Linux" : "",
    ].filter(Boolean),
    price: centsToPrice(item.final_price),
    originalPrice: item.discounted ? centsToPrice(item.original_price) : undefined,
    discountPercent: item.discounted ? item.discount_percent : undefined,
  }));
}

export async function getRecentlyViewedGames(): Promise<RecentlyViewedGame[]> {
  const rawData = await fetchFeaturedData();
  return rawData.specials.items.slice(0, 4).map((item) => ({
    id: String(item.id),
    title: item.name,
    label: item.discounted ? `${item.discount_percent}% OFF` : "FULL PRICE",
    price: centsToPrice(item.final_price),
  }));
}

export async function getRelatedGames(): Promise<RelatedGame[]> {
  const rawData = await fetchFeaturedData();
  return rawData.specials.items.slice(0, 4).map((item, i) => ({
    ...rawToGame(item, i),
    genreBadge: ["RPG", "ACTION", "SHOOTER", "ADVENTURE"][i % 4],
  }));
}
