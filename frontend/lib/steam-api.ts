import type { BackendGameDetail, Game, Platform } from "./types";

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

interface BackendGenre {
  id: number;
  description: string;
}

interface GameSummary {
  id: number;
  steamAppId: number;
  name: string;
  slug: string;
  headerImage: string;
  priceFinal: number;
  reductionPercentage: number;
  recommendationsTotal: number;
  releaseDate: string;
  genres: BackendGenre[];
}

interface BackendPage {
  content: GameSummary[];
  totalElements: number;
  totalPages: number;
}

interface BackendLowDeals {
  under_5: BackendPage;
  under_10: BackendPage;
  under_20: BackendPage;
}

interface BackendFeatureResponse {
  topseller: BackendPage;
  new_release: BackendPage;
  low_deals: BackendLowDeals;
  upcoming: BackendPage;
}

function gameSummaryToRawItem(game: GameSummary): RawItem {
  const discounted = game.reductionPercentage > 0;
  const finalCents = game.priceFinal;
  const originalCents = discounted
    ? Math.round(finalCents / (1 - game.reductionPercentage / 100))
    : finalCents;

  return {
    id: game.steamAppId,
    name: game.name,
    discounted,
    discount_percent: game.reductionPercentage,
    original_price: discounted ? originalCents : null,
    final_price: finalCents,
    currency: "USD",
    large_capsule_image: game.headerImage,
    small_capsule_image: game.headerImage,
    header_image: game.headerImage,
    windows_available: true,
    mac_available: false,
    linux_available: false,
  };
}

function backendPageToItems(page: BackendPage): RawItem[] {
  return page.content.map(gameSummaryToRawItem);
}

function backendToRawFeaturedData(data: BackendFeatureResponse): RawFeaturedData {
  const dealItems = [
    ...data.low_deals.under_5.content,
    ...data.low_deals.under_10.content,
    ...data.low_deals.under_20.content,
  ];
  const seen = new Set<number>();
  const uniqueDealItems = dealItems.filter((g) => {
    if (seen.has(g.steamAppId)) return false;
    seen.add(g.steamAppId);
    return true;
  });

  return {
    specials: { items: uniqueDealItems.map(gameSummaryToRawItem) },
    top_sellers: { items: backendPageToItems(data.topseller) },
    new_releases: { items: backendPageToItems(data.new_release) },
    coming_soon: { items: backendPageToItems(data.upcoming) },
  };
}

let cachedFeaturedData: RawFeaturedData | null = null;

export async function fetchFeaturedData(): Promise<RawFeaturedData> {
  if (cachedFeaturedData) return cachedFeaturedData;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/steam/featured`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch featured data: ${res.status}`);
  const data: BackendFeatureResponse = await res.json();
  cachedFeaturedData = backendToRawFeaturedData(data);
  return cachedFeaturedData;
}

/* ── Helpers ── */

export function centsToPrice(cents: number | null): number {
  if (cents == null || cents === 0) return 0;
  return cents / 100;
}

export function rawToGame(
  item: {
    id: number;
    name: string;
    discounted: boolean;
    discount_percent: number;
    original_price: number | null;
    final_price: number;
    large_capsule_image: string;
    header_image: string;
    windows_available: boolean;
    mac_available: boolean;
    linux_available: boolean;
  },
  index: number
): Game {
  const price = centsToPrice(item.final_price);
  const originalPrice = item.discounted
    ? centsToPrice(item.original_price)
    : undefined;
  const discountPercent = item.discounted ? item.discount_percent : undefined;

  const badges: Game["badges"] = [];
  if (item.discounted && item.discount_percent > 0) badges.push("discount");

  const platforms: Platform[] = [];
  if (item.windows_available) platforms.push("windows");
  if (item.mac_available) platforms.push("mac");
  if (item.linux_available) platforms.push("linux");

  return {
    id: `${item.id}-${index}`,
    title: item.name,
    slug: item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    platforms,
    genres: [],
    price,
    originalPrice,
    discountPercent,
    badges,
    image: item.large_capsule_image,
    headerImage: item.header_image,
  };
}

/* ── Steam app details ── */

export async function fetchSteamAppDetails(
  appid: number
): Promise<BackendGameDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/steam/${appid}`);
  if (!res.ok) return null;
  return res.json();
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

  const data: { total: number; items: Array<{ type: string; name: string; id: number; price?: { currency: string; initial: number; final: number }; tiny_image: string; metascore?: string; platforms: { windows: boolean; mac: boolean; linux: boolean } }> } = await res.json();
  return {
    total: data.total ?? 0,
    games: (data.items ?? [])
      .filter((item) => item.type === "app")
      .map((item) => {
        const finalCents = item.price?.final ?? 0;
        const initialCents = item.price?.initial ?? 0;
        const price = centsToPrice(finalCents);
        const originalPrice =
          initialCents !== finalCents ? centsToPrice(initialCents) : undefined;
        const discountPercent =
          originalPrice != null && initialCents > 0
            ? Math.round(((initialCents - finalCents) / initialCents) * 100)
            : undefined;

        const platforms: Platform[] = [];
        if (item.platforms.windows) platforms.push("windows");
        if (item.platforms.mac) platforms.push("mac");
        if (item.platforms.linux) platforms.push("linux");

        return {
          id: String(item.id),
          title: item.name,
          slug: item.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          platforms,
          genres: [],
          price,
          originalPrice,
          discountPercent,
          badges: (discountPercent ? ["discount"] : []) as Game["badges"],
        };
      }),
  };
}
