import type { BackendGameDetail, BackendPage, Game } from "./types";

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

/* ── Featured data ── */

interface FeaturedData {
  specials: Game[];
  topSellers: Game[];
  newReleases: Game[];
  comingSoon: Game[];
}

let cachedFeaturedData: FeaturedData | null = null;

export async function fetchFeaturedData(): Promise<FeaturedData> {
  if (cachedFeaturedData) return cachedFeaturedData;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/steam/featured`, {
    next: { revalidate: 3600 },
  });
  const empty: FeaturedData = { specials: [], topSellers: [], newReleases: [], comingSoon: [] };

  if (!res.ok) return empty;
  const data: BackendFeatureResponse = await res.json();

  const dealItems = [
    ...(data.lowDeals?.under5?.content ?? []),
    ...(data.lowDeals?.under10?.content ?? []),
    ...(data.lowDeals?.under20?.content ?? []),
  ];
  const seen = new Set<number>();
  const specials = dealItems.filter((g) => {
    if (seen.has(g.steamAppId)) return false;
    seen.add(g.steamAppId);
    return true;
  });

  cachedFeaturedData = {
    specials,
    topSellers: data.topseller?.content ?? [],
    newReleases: data.newRelease?.content ?? [],
    comingSoon: data.upcoming?.content ?? [],
  };
  return cachedFeaturedData;
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

interface SearchGamesParams {
  search?: string;
  page?: number;
  size?: number;
  genreId?: number;
}

export async function searchSteamGames(
  params: SearchGamesParams
): Promise<{ total: number; totalPages: number; games: Game[] }> {
  const baseUrl = process.env.BACKEND_URL || "http://localhost:8080";
  const url = new URL(`${baseUrl}/api/games`);

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
    games: data.content ?? [],
  };
}
