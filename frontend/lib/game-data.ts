import type {
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
} from "./steam-api";

/* ── Catalog by genre (server-side, calls backend directly) ── */

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

function gameSummaryToGame(game: GameSummary, index: number): Game {
  const discounted = game.reductionPercentage > 0;
  const finalCents = game.priceFinal;
  const originalCents = discounted
    ? Math.round(finalCents / (1 - game.reductionPercentage / 100))
    : finalCents;

  const base = rawToGame(
    {
      id: game.steamAppId,
      backendId: game.id,
      name: game.name,
      discounted,
      discount_percent: game.reductionPercentage,
      original_price: discounted ? originalCents : null,
      final_price: finalCents,
      large_capsule_image: game.headerImage,
      header_image: game.headerImage,
      windows_available: true,
      mac_available: false,
      linux_available: false,
    },
    index
  );

  return { ...base, genres: game.genres.map((g) => g.description) };
}

export async function getCatalogGamesByGenre(
  genreId: number,
  size = 100
): Promise<{ games: Game[]; genreLabel: string | null }> {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  const url = new URL(`${backendUrl}/api/games`);
  url.searchParams.set("genreId", String(genreId));
  url.searchParams.set("size", String(size));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return { games: [], genreLabel: null };

  const data: BackendPage = await res.json();
  const games = data.content.map(gameSummaryToGame);

  // Derive label from the first game that has the genre
  const genreLabel =
    data.content
      .flatMap((g) => g.genres)
      .find((g) => g.id === genreId)?.description ?? null;

  return { games, genreLabel };
}

/* ── Hero Slides ── */

const heroGradients = [
  { from: "#0f2027", to: "#203a43" },
  { from: "#1a0033", to: "#330066" },
  { from: "#1c1c00", to: "#3a3a00" },
  { from: "#0a1628", to: "#162844" },
  { from: "#1a0000", to: "#330011" },
];

/* ── Recommended games ── */

export async function getRecommendedGames(): Promise<Game[]> {
  const rawData = await fetchFeaturedData();
  return rawData.specials.items.map(rawToGame);
}

/* ── Bestsellers ── */

export async function getBestsellerGames(): Promise<BestsellerGame[]> {
  const rawData = await fetchFeaturedData();
  return rawData.top_sellers.items
    .slice(0, 20)
    .map((item, i) => ({ ...rawToGame(item, i), rank: i + 1 }))
    .filter((game) => game.price < 150)
    .slice(0, 10);
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

export async function getCatalogGames(
  size = 100
): Promise<{ games: Game[]; genreLabel: null }> {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  const url = new URL(`${backendUrl}/api/games`);
  url.searchParams.set("size", String(size));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return { games: [], genreLabel: null };

  const data: BackendPage = await res.json();
  return { games: data.content.map(gameSummaryToGame), genreLabel: null };
}

/* ── Related games ── */

export async function getRelatedGames(): Promise<RelatedGame[]> {
  const rawData = await fetchFeaturedData();
  return rawData.specials.items.slice(0, 4).map((item, i) => ({
    ...rawToGame(item, i),
    genreBadge: ["RPG", "ACTION", "SHOOTER", "ADVENTURE"][i % 4],
  }));
}

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
