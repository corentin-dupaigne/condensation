# Remove Slug from Frontend URLs — Design Spec

**Date:** 2026-04-06
**Status:** Draft

---

## Context

The game detail page currently lives at `/games/[slug]` and uses a two-step fetch:
1. Search through Steam featured data by slugifying game names to find the game
2. Fetch `/api/steam/[appid]` (→ backend `/api/games/[appid]`) for full details

The response (`BackendGameDetail`) is then partially mapped onto the legacy `GameDetail` type (snake_case → camelCase, mixed with fallback defaults). This indirection is unnecessary now that the backend directly exposes the game detail endpoint.

---

## Goal

1. Replace `/games/[slug]` route with `/games/[id]` using the game's numeric `id` from the backend
2. Fetch `BackendGameDetail` directly from the backend (single API call)
3. Remove the legacy `GameDetail` type and all mapping code
4. Update every link in the frontend to use `/games/[id]` instead of `/games/[slug]`

---

## Changes by File

### Route

- **`app/games/[slug]/` → `app/games/[id]/`**
  - Rename the directory. The dynamic segment is now `id` (numeric string).
  - `generateMetadata` fetches the game directly via `/api/steam/[id]` (the existing proxy route).
  - Page component fetches `/api/steam/[id]`, gets `BackendGameDetail`, passes it directly to components — no mapping, no fallback defaults.

### API Proxy

- **`app/api/steam/[appid]/route.ts` → `app/api/steam/[id]/route.ts`**
  - Rename the file for consistency with the page route. Functionality unchanged.

### Types

- **Remove `GameDetail`** from `lib/types.ts` — it is replaced by `BackendGameDetail`.
- **Remove all Steam-specific types no longer needed** (only those exclusively used by `GameDetail`):
  - `SteamPriceOverview` (replaced by raw backend fields)
  - `SteamPlatforms` (replaced by raw backend fields)
  - `SteamRequirements` — kept because `BackendGameDetail` uses it
  - `SteamScreenshot` (replaced by `BackendScreenshot`)
  - `SteamMovie` (replaced by `BackendMovie`)
  - `SteamGenre` (replaced by inline `{ id: number; description: string }`)
  - `SteamCategory` — kept, used by `BackendGameDetail`
- **Remove `DeluxePerk`, `DLCItem`, `Achievement`** — not used in current codebase.

### Components

- **`components/product/ProductHero.tsx`**
  - Prop type changes from `GameDetail` to `BackendGameDetail`.
  - Update field accesses:
    - `game.title` → `game.name`
    - `game.detailed_description` → `game.detailedDescription`
    - `game.about_the_game` → `game.aboutTheGame`
    - `game.supported_languages` → `game.supportedLanguages`
    - `game.developers` → computed from `game.companies` (filter by role `"developer"`)
    - `game.publishers` → computed from `game.companies` (filter by role other than `"developer"`)
    - `game.genres` → already `{ id: number; description: string }[]`
    - `game.platforms` → already `SteamPlatforms`
    - `game.price_overview.final` → `game.priceFinal`
    - `game.price_overview.initial` → `game.priceInitial`
    - `game.price_overview.discount_percent` → `game.reductionPercentage`
    - `game.price_overview.currency` → `game.currency`
    - `game.metacritic_score` → `game.metacriticScore`
    - `game.recommendations_total` → `game.recommendationsTotal`
    - `game.required_age` → `game.requiredAge`
    - `game.pc_requirements` → `game.pcRequirements`
    - `game.mac_requirements` → `game.macRequirements`
    - `game.linux_requirements` → `game.linuxRequirements`
    - `game.screenshots` → already `BackendScreenshot[]` (access `path_thumbnail`/`path_full` via backend field names)
    - `game.movies` → already `BackendMovie[]` (access `hls_h264`/`dash_av1` via backend field names)
    - `game.headerImage` → `game.headerImage`
  - Computed values (`finalPrice`, `initialPrice`) use `game.priceFinal / 100` directly (price is already in cents on backend).

- **`components/product/GameInfoSidebar.tsx`**
  - Prop type changes from `GameDetail` to `BackendGameDetail`.
  - Update field accesses:
    - `game.genres` → same shape, no change
    - `game.categories` → same shape, no change
    - `game.supported_languages` → `game.supportedLanguages`
    - `game.platforms` → `SteamPlatforms` (unchanged)
    - `game.pc_requirements` → `game.pcRequirements`
    - `game.mac_requirements` → `game.macRequirements`
    - `game.linux_requirements` → `game.linuxRequirements`

- **`components/shared/GameCard.tsx`** — `href` changes from `game.slug` to `game.id` (no type change needed, `game.id` is string for `Game` type used here).

- **`components/shared/ListCard.tsx`** — same as `GameCard`.

- **`components/home/HeroCarousel.tsx`** — static `ctaLink` values update slugs to numeric ids.

- **`components/home/BestsellersSection.tsx`** — `href` changes from `game.slug` to `game.id`.

### Data Layer

- **`lib/steam-api.ts`**
  - Remove `steamDataToGameDetail` — no longer needed.
  - Remove `RawItem`, `RawFeaturedData`, `SteamSearchItem`, `SteamSearchResult`, `searchItemToGame`, `searchItemPlatforms`, `gameSummaryToRawItem`, `backendPageToItems`, `backendToRawFeaturedData`, `cachedFeaturedData`, `fetchFeaturedData` — these exist to support the two-step slug-based lookup which is being removed. **Keep** these for now because other pages (home, catalog) still rely on `fetchFeaturedData` for listing games — they can be migrated in a follow-up.
  - Update `fetchSteamAppDetails` to return `BackendGameDetail | null` (already typed correctly, but the comment explaining the proxy role can be removed).

- **`lib/game-data.ts`**
  - `getHeroSlides`: `ctaLink` changes to `/games/${item.id}` (numeric `steamAppId` from `GameSummary`).
  - `getRecommendedGames`, `getBestsellerGames`, `getNewReleases`, `getPreOrders`, `getDealTiers`, `getCatalogGames`, `getRelatedGames`: unchanged — these return `Game[]` for listing pages and still use slug-based links in card components.
  - `getGameBySlug`: **removed entirely** — replaced by direct `/api/steam/[id]` fetch in the page.
  - Remove `slugify` import if no longer used.

- **`lib/cart-store.ts`**
  - `cartItemFromGame(game: Game | GameDetail)`: type param changes to `Game | BackendGameDetail`.
  - `id` field: `game.slug` → `String(game.id)` (handles both string and number ids).
  - `title`: `game.title` → `game.name` (for `BackendGameDetail`).
  - `image`: unchanged (both have `headerImage`).
  - `price`: `game.price` → `game.priceFinal / 100` (for `BackendGameDetail`).
  - `originalPrice`: `game.originalPrice` → for `BackendGameDetail`, derive from `priceInitial`.
  - `discountPercent`: `game.discountPercent` → `game.reductionPercentage` (for `BackendGameDetail`).

---

## Removed Code Summary

| Item | Location | Reason |
|---|---|---|
| `GameDetail` type | `lib/types.ts` | Replaced by `BackendGameDetail` |
| `DeluxePerk`, `DLCItem`, `Achievement` | `lib/types.ts` | Unused |
| `steamDataToGameDetail` | `lib/steam-api.ts` | No longer needed |
| `getGameBySlug` | `lib/game-data.ts` | Route no longer uses slug |
| `[slug]` route directory | `app/games/[slug]/` | Replaced by `[id]` |
| Snake_case field mappings in page | `app/games/[id]/page.tsx` | Backend uses snake_case directly |

---

## Backwards Compatibility Note

Existing cart items stored in localStorage use `game.slug` as the `CartItem.id`. After this change, newly added items will use `String(game.id)`. Cart items with old slug-based IDs will remain in storage but can be ignored or cleared in a follow-up migration.
