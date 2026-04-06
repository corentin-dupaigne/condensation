export type Platform = "windows" | "mac" | "linux";

export type BadgeType =
  | "discount"
  | "new"
  | "pre-order"
  | "rare"
  | "popular"
  | "instant";

export interface Game {
  id: string;
  title: string;
  slug: string;
  platforms: Platform[];
  genres: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  badges: BadgeType[];
  releaseDate?: string;
  releasedAgo?: string;
  timeLeft?: string;
  image?: string;
  headerImage?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  price: number;
  gradientFrom: string;
  gradientTo: string;
  image?: string;
}

export interface BestsellerGame extends Game {
  rank: number;
}

export interface DealTier {
  label: string;
  maxPrice: number;
  games: Game[];
}

export type SortOption =
  | "bestselling"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "discount";

export type ViewMode = "grid" | "list";

export interface CatalogFilters {
  platforms: Platform[];
  genres: string[];
  priceMin: number;
  priceMax: number;
}

/* ── Product Detail Page ── */

export interface SteamCategory {
  id: number;
  description: string;
}

export interface SteamRequirements {
  minimum?: string;
  recommended?: string;
}

export type RelatedGame = Game & { genreBadge: string };

/* ── Backend /api/games/{id} response ── */

export interface BackendCompany {
  company: { id: number; name: string };
  role: string;
}

export interface BackendScreenshot {
  id: number;
  steamId: number;
  pathThumbnail: string;
  pathFull: string;
  position: number;
}

export interface BackendMovie {
  id: number;
  steamId: number;
  name: string;
  thumbnail: string;
  dashAv1?: string;
  dashH264?: string;
  hlsH264?: string;
  highlight: boolean;
  position: number;
}

export interface BackendGameDetail {
  id: number;
  steamAppId: number;
  name: string;
  slug: string;
  headerImage: string;
  priceFinal: number;
  reductionPercentage: number;
  recommendationsTotal: number;
  releaseDate: string;
  releaseDateRaw: string;
  genres: { id: number; description: string }[];
  detailedDescription: string;
  aboutTheGame: string;
  supportedLanguages: string;
  requiredAge: number;
  metacriticScore: number;
  currency: string;
  priceInitial: number;
  pcRequirements: SteamRequirements;
  macRequirements: SteamRequirements;
  linuxRequirements: SteamRequirements;
  companies: BackendCompany[];
  categories: SteamCategory[];
  screenshots: BackendScreenshot[];
  movies: BackendMovie[];
  updatedAt: string;
}
