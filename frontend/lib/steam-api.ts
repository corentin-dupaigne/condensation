import type { Game, GameDetail, Platform, SteamAppData } from "./types";

/* ── Raw Steam featured API types ── */

export interface RawItem {
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

export interface RawFeaturedData {
  specials: { items: RawItem[] };
  top_sellers: { items: RawItem[] };
  new_releases: { items: RawItem[] };
  coming_soon: { items: RawItem[] };
}

/* ── Raw Steam storesearch API types ── */

export interface SteamSearchItem {
  type: string;
  name: string;
  id: number;
  price?: {
    currency: string;
    initial: number;
    final: number;
  };
  tiny_image: string;
  metascore?: string;
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
}

export interface SteamSearchResult {
  total: number;
  items: SteamSearchItem[];
}

/* ── Helpers ── */

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function centsToPrice(cents: number | null): number {
  if (cents == null || cents === 0) return 0;
  return cents / 100;
}

function detectPlatforms(item: RawItem): Platform[] {
  const out: Platform[] = [];
  if (item.windows_available) out.push("windows");
  if (item.mac_available) out.push("mac");
  if (item.linux_available) out.push("linux");
  return out;
}

export function rawToGame(item: RawItem, index: number): Game {
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
    platforms: detectPlatforms(item),
    genres: [],
    price,
    originalPrice,
    discountPercent,
    badges,
    image: item.large_capsule_image,
    headerImage: item.header_image,
  };
}

function searchItemPlatforms(item: SteamSearchItem): Platform[] {
  const out: Platform[] = [];
  if (item.platforms.windows) out.push("windows");
  if (item.platforms.mac) out.push("mac");
  if (item.platforms.linux) out.push("linux");
  return out;
}

function searchItemToGame(item: SteamSearchItem): Game {
  const finalCents = item.price?.final ?? 0;
  const initialCents = item.price?.initial ?? 0;
  const price = centsToPrice(finalCents);
  const originalPrice =
    initialCents !== finalCents ? centsToPrice(initialCents) : undefined;
  const discountPercent =
    originalPrice != null && initialCents > 0
      ? Math.round(((initialCents - finalCents) / initialCents) * 100)
      : undefined;

  return {
    id: String(item.id),
    title: item.name,
    slug: slugify(item.name),
    platforms: searchItemPlatforms(item),
    genres: [],
    price,
    originalPrice,
    discountPercent,
    badges: discountPercent ? ["discount"] : [],
  };
}

/* ── In-memory cache for featured data ── */

let cachedFeaturedData: RawFeaturedData | null = null;

export async function fetchFeaturedData(): Promise<RawFeaturedData> {
  if (cachedFeaturedData) return cachedFeaturedData;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/steam/featured`, {
    next: { revalidate: 3600 },
  });
  cachedFeaturedData = await res.json();
  return cachedFeaturedData as RawFeaturedData;
}

/* ── Steam app details ── */

export async function fetchSteamAppDetails(
  appid: number
): Promise<SteamAppData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/steam/${appid}`);
  if (!res.ok) return null;
  return res.json();
}

export function steamDataToGameDetail(
  appData: SteamAppData,
  basePrice: number
): Partial<GameDetail> {
  return {
    detailed_description: appData.detailed_description ?? "",
    about_the_game: appData.about_the_game ?? "",
    supported_languages: appData.supported_languages ?? "English",
    developers: appData.developers ?? ["Unknown"],
    publishers: appData.publishers ?? ["Unknown"],
    releaseDate: appData.release_date?.date,
    genres: appData.genres ?? [],
    categories: appData.categories ?? [],
    platforms: appData.platforms ?? { windows: true, mac: false, linux: false },
    price_overview: {
      currency: appData.price_overview?.currency ?? "USD",
      initial: appData.price_overview?.initial ?? Math.round(basePrice * 100),
      final: appData.price_overview?.final ?? Math.round(basePrice * 100),
      discount_percent: appData.price_overview?.discount_percent ?? 0,
      initial_formatted: appData.price_overview?.initial_formatted ?? "",
      final_formatted:
        appData.price_overview?.final_formatted ?? `$${basePrice.toFixed(2)}`,
    },
    screenshots: appData.screenshots ?? [],
    movies: appData.movies ?? [],
    pc_requirements: appData.pc_requirements ?? {},
    mac_requirements: appData.mac_requirements,
    linux_requirements: appData.linux_requirements,
    recommendations_total: appData.recommendations?.total ?? 0,
    metacritic_score: appData.metacritic?.score ?? 0,
    required_age: appData.required_age ?? "",
    headerImage: appData.header_image,
  };
}

/* ── Steam store search ── */

export async function searchSteamGames(
  term: string
): Promise<{ total: number; games: Game[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/steam/search?q=${encodeURIComponent(term)}`,
    { cache: "no-store" }
  );

  if (!res.ok) return { total: 0, games: [] };

  const data: SteamSearchResult = await res.json();
  return {
    total: data.total ?? 0,
    games: (data.items ?? [])
      .filter((item) => item.type === "app")
      .map(searchItemToGame),
  };
}
