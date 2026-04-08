import type { BackendGameDetail, Game, Platform } from "./types";

/* ── Raw Steam featured API types ── */

export interface RawItem {
  id: number;
  backendId: number;
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
  under5: BackendPage;
  under10: BackendPage;
  under20: BackendPage;
}

interface BackendFeatureResponse {
  topseller: BackendPage;
  newRelease: BackendPage;
  lowDeals: BackendLowDeals;
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
    backendId: game.id,
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
    ...(data.lowDeals?.under5?.content ?? []),
    ...(data.lowDeals?.under10?.content ?? []),
    ...(data.lowDeals?.under20?.content ?? []),
  ];
  const seen = new Set<number>();
  const uniqueDealItems = dealItems.filter((g) => {
    if (seen.has(g.steamAppId)) return false;
    seen.add(g.steamAppId);
    return true;
  });

  return {
    specials: { items: uniqueDealItems.map(gameSummaryToRawItem) },
    top_sellers: { items: data.topseller ? backendPageToItems(data.topseller) : [] },
    new_releases: { items: data.newRelease ? backendPageToItems(data.newRelease) : [] },
    coming_soon: { items: data.upcoming ? backendPageToItems(data.upcoming) : [] },
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
    backendId: number;
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
  _index: number
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
    id: String(item.backendId),
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

/* ── Backend games search ── */

export interface SearchGamesParams {
  search?: string;
  page?: number;
  size?: number;
  genreId?: number;
}

export async function searchSteamGames(
  params: SearchGamesParams
): Promise<{ total: number; totalPages: number; games: Game[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = new URL(`${baseUrl}/api/steam/games`);

  if (params.search) url.searchParams.set("search", params.search);
  if (params.page != null) url.searchParams.set("page", String(params.page));
  if (params.size != null) url.searchParams.set("size", String(params.size));
  if (params.genreId != null) url.searchParams.set("genreId", String(params.genreId));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return { total: 0, totalPages: 0, games: [] };

  const data: BackendPage = await res.json();
  return {
    total: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    games: (data.content ?? []).map((game) => rawToGame(gameSummaryToRawItem(game), 0)),
  };
}
