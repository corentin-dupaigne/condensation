export type Platform = "steam" | "epic" | "xbox" | "playstation" | "switch";

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
  platform: Platform;
  genres: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  badges: BadgeType[];
  releaseDate?: string;
  releasedAgo?: string;
  timeLeft?: string;
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

export interface LanguageSupport {
  language: string;
  interface: boolean;
  audio: boolean;
  subtitles: boolean;
}

export interface SystemRequirements {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
}

export interface GameDetail extends Game {
  description: string[];
  developer: string;
  publisher: string;
  features: string[];
  languages: LanguageSupport[];
  metaScore: number;
  recommendedPercent: number;
  ageRating: string;
  editionStandardPrice: number;
  editionDeluxePrice: number;
  systemRequirements: {
    minimum: SystemRequirements;
    recommended: SystemRequirements;
  };
}

export interface DeluxePerk {
  icon: string;
  title: string;
  description: string;
}

export interface DLCItem {
  id: string;
  title: string;
  price: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

export type RelatedGame = Game & { genreBadge: string };

/* ── Search Results Page ── */

export type SearchBadgeType = "ultimate-edition" | "standard" | "legendary-bundle";

export interface SearchResultGame {
  id: string;
  title: string;
  slug: string;
  platforms: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  badge?: SearchBadgeType;
  wishlistAdded?: boolean;
}

export interface RecentlyViewedGame {
  id: string;
  title: string;
  label: string;
  price: number;
}
