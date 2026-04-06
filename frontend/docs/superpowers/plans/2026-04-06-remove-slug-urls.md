# Remove Slug from Frontend URLs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/games/[slug]` route with `/games/[id]` so the game detail page fetches `BackendGameDetail` directly from the backend in a single API call, and remove the legacy `GameDetail` type and all slug-based lookup code.

**Architecture:** The page route is renamed from `[slug]` to `[id]`. The page fetches `BackendGameDetail` directly from `/api/steam/[id]` (the existing proxy). Product components (`ProductHero`, `GameInfoSidebar`) receive `BackendGameDetail` instead of `GameDetail`, with field accesses updated from legacy snake_case to the backend's camelCase shape. All card/carousel links that pointed to `/games/${slug}` are updated to `/games/${game.id}` (or the numeric id for static slides).

**Tech Stack:** Next.js App Router, TypeScript, React.

---

## File Map

| File | Change |
|---|---|
| `app/games/[slug]/` | Delete directory |
| `app/games/[id]/page.tsx` | Create (migrated from `[slug]/page.tsx`) |
| `app/api/steam/[appid]/route.ts` | Rename directory to `[id]` |
| `lib/types.ts` | Remove `GameDetail`, `DeluxePerk`, `DLCItem`, `Achievement`, `SteamPriceOverview`, `SteamPlatforms`, `SteamScreenshot`, `SteamMovie`, `SteamGenre`; keep `SteamCategory`, `SteamRequirements`, `BackendGameDetail` |
| `lib/steam-api.ts` | Remove `steamDataToGameDetail`, `RawItem`, `RawFeaturedData`, `SteamSearchItem`, `SteamSearchResult`, `searchItemToGame`, `searchItemPlatforms`, `gameSummaryToRawItem`, `backendPageToItems`, `backendToRawFeaturedData`, `cachedFeaturedData`, `fetchFeaturedData`, `slugify`; keep `fetchSteamAppDetails`, `searchSteamGames`, `centsToPrice`, `rawToGame` |
| `lib/game-data.ts` | Remove `getGameBySlug` and `slugify` import; update `getHeroSlides` ctaLink |
| `lib/cart-store.ts` | Update `cartItemFromGame` to accept `Game \| BackendGameDetail` |
| `components/product/ProductHero.tsx` | Prop type → `BackendGameDetail`; update all field accesses |
| `components/product/GameInfoSidebar.tsx` | Prop type → `BackendGameDetail`; update field accesses |
| `components/shared/GameCard.tsx` | `href` → `/games/${game.id}` |
| `components/shared/ListCard.tsx` | `href` → `/games/${game.id}` |
| `components/home/BestsellersSection.tsx` | `href` → `/games/${game.id}` |
| `components/home/HeroCarousel.tsx` | `ctaLink` → `/games/${slide.id}` (numeric string already in `id` field) |

---

## Task 1: Create `app/games/[id]/page.tsx` and Rename API Route

**Files:**
- Create: `app/games/[id]/page.tsx`
- Delete: `app/games/[slug]/` (entire directory)
- Rename: `app/api/steam/[appid]/` → `app/api/steam/[id]/`

- [ ] **Step 1: Create `app/games/[id]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ProductHero } from "@/components/product/ProductHero";
import { GameDescription } from "@/components/product/GameDescription";
import { RelatedGames } from "@/components/product/RelatedGames";
import { GameInfoSidebar } from "@/components/product/GameInfoSidebar";
import { fetchSteamAppDetails } from "@/lib/steam-api";
import { getRelatedGames } from "@/lib/game-data";
import type { BackendGameDetail } from "@/lib/types";
import { getAuthState } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const appid = Number(id);
  if (isNaN(appid)) return { title: "Game Not Found — Condensation" };
  const data = await fetchSteamAppDetails(appid);
  if (!data) return { title: "Game Not Found — Condensation" };
  return {
    title: `${data.name} — Condensation`,
    description: `Buy ${data.name} on Condensation. Best prices guaranteed.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const appid = Number(id);
  if (isNaN(appid)) notFound();

  const [steamData, relatedGames, { isLoggedIn, userName }] = await Promise.all([
    fetchSteamAppDetails(appid),
    getRelatedGames(),
    getAuthState(),
  ]);

  if (!steamData) notFound();

  const game: BackendGameDetail = steamData;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Games", href: "/games" },
    ...(game.genres[0]?.description
      ? [
          {
            label: game.genres[0].description,
            href: `/games?genre=${game.genres[0].description.toLowerCase()}`,
          },
        ]
      : []),
    { label: game.name },
  ];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <ProductHero game={game} />

        <div className="mx-auto flex max-w-7xl gap-20 mb-8">
          <div className="w-2/3">
            <GameDescription
              title={game.name}
              detailedDescription={game.detailedDescription}
              aboutTheGame={game.aboutTheGame}
            />
          </div>

          <div className="w-1/3">
            <GameInfoSidebar game={game} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-16">
          <RelatedGames games={relatedGames} />
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Delete `app/games/[slug]/` directory**

Run: `rm -rf app/games/[slug]`

- [ ] **Step 3: Rename `app/api/steam/[appid]/` to `app/api/steam/[id]/`**

Run: `mv app/api/steam/[appid] app/api/steam/[id]`

Note: The route handler code inside `route.ts` does not reference the param name in any non-forwarded way — it only destructures `{ appid }` and passes it to the backend URL as-is. No code changes needed in the route handler itself.

- [ ] **Step 4: Commit**

```bash
git add app/games/[id]/ app/games/[slug]/ app/api/steam/[id]/
git rm -r app/games/[slug]
git mv app/api/steam/[appid] app/api/steam/[id]
git commit -m "feat: replace /games/[slug] with /games/[id] route"
```

---

## Task 2: Update `lib/types.ts` — Remove Legacy Types

**Files:**
- Modify: `lib/types.ts:114-209`

Remove the following types entirely (lines 114–152, lines 73–76 for `SteamGenre`):

- `GameDetail` interface (lines 114–132)
- `DeluxePerk` interface (lines 134–138)
- `DLCItem` interface (lines 140–144)
- `Achievement` interface (lines 146–151)
- `SteamPriceOverview` interface (lines 90–97)
- `SteamPlatforms` interface (lines 84–88)
- `SteamScreenshot` interface (lines 78–82)
- `SteamMovie` interface (lines 104–112)
- `SteamGenre` interface (lines 73–76)

Keep: `Platform`, `BadgeType`, `Game`, `HeroSlide`, `BestsellerGame`, `DealTier`, `SortOption`, `ViewMode`, `CatalogFilters`, `SteamCategory`, `SteamRequirements`, `BackendCompany`, `BackendScreenshot`, `BackendMovie`, `BackendGameDetail`, `RelatedGame`.

Also update `RelatedGame` — it currently extends `Game` which still has the `slug` field; the `slug` field stays on `Game` because listing pages still use slugs in URLs for now (pending follow-up migration).

**Note on `Game.genres`:** The `Game` type uses `genres: string[]`. The `BackendGameDetail.genres` is `{ id: number; description: string }[]`. These are different shapes — product components will receive `BackendGameDetail` directly and use its genre shape, while listing/card components still use `Game` with `string[]`.

After removing all the above types, the file should export only the kept types. No other changes needed.

- [ ] **Step 1: Edit `lib/types.ts`** — remove the 9 types listed above. Ensure `SteamCategory`, `SteamRequirements`, and `BackendGameDetail` remain. Ensure `Game`, `RelatedGame`, and `HeroSlide` remain.

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "refactor: remove GameDetail and 8 legacy Steam types"
```

---

## Task 3: Update `lib/steam-api.ts` — Remove Slug-Based Code

**Files:**
- Modify: `lib/steam-api.ts`

Remove all of the following (keep `fetchSteamAppDetails` and `searchSteamGames`):

1. **Types to remove**: `RawItem`, `RawFeaturedData`, `SteamSearchItem`, `SteamSearchResult`, `BackendGenre`, `GameSummary`, `BackendPage`, `BackendLowDeals`, `BackendFeatureResponse` — these are only used by `fetchFeaturedData`.

2. **Functions to remove**: `slugify`, `searchItemPlatforms`, `searchItemToGame`, `gameSummaryToRawItem`, `backendPageToItems`, `backendToRawFeaturedData`, `fetchFeaturedData`, `steamDataToGameDetail`, the in-memory `cachedFeaturedData` variable.

3. **Keep**: `centsToPrice`, `rawToGame`, `fetchSteamAppDetails`, `searchSteamGames`.

After removal, the file should contain:
- `centsToPrice`
- `rawToGame` (used by other listing functions in `game-data.ts`)
- `fetchSteamAppDetails`
- `searchSteamGames`

The `import type { BackendGameDetail, Game, Platform }` import must be kept (drop `GameDetail`).

- [ ] **Step 1: Rewrite `lib/steam-api.ts`** with only the 4 kept exports. Ensure `fetchSteamAppDetails` and `searchSteamGames` are unchanged.

- [ ] **Step 2: Verify** the file compiles: `npx tsc --noEmit lib/steam-api.ts` (or `pnpm tsc --noEmit` if that's the package manager). Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/steam-api.ts
git commit -m "refactor: remove slug-based lookup from steam-api"
```

---

## Task 4: Update `lib/game-data.ts` — Remove `getGameBySlug`, Update Hero Links

**Files:**
- Modify: `lib/game-data.ts`

Changes:
1. Remove the `slugify` import from `./steam-api`.
2. Remove `getGameBySlug` function (lines 141–160).
3. In `getHeroSlides`, change the `ctaLink` from `/games/${slugify(item.name)}` to `/games/${item.id}`.

Everything else stays unchanged — `rawToGame`, `centsToPrice`, and `fetchFeaturedData` are still needed by the listing functions.

```typescript
// In getHeroSlides, change line 34:
// BEFORE: ctaLink: `/games/${slugify(item.name)}`,
// AFTER:  ctaLink: `/games/${item.id}`,
```

- [ ] **Step 1: Edit `lib/game-data.ts`** — remove `slugify` from imports, remove `getGameBySlug`, update `ctaLink` in `getHeroSlides`.

- [ ] **Step 2: Verify** the file compiles: `npx tsc --noEmit lib/game-data.ts`. Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/game-data.ts
git commit -m "refactor: remove getGameBySlug and use id-based links in hero slides"
```

---

## Task 5: Update `lib/cart-store.ts` — Fix `cartItemFromGame` for `BackendGameDetail`

**Files:**
- Modify: `lib/cart-store.ts:151-163`

The `cartItemFromGame` function is called from `ProductHero` (via the add-to-cart button) with a `BackendGameDetail` object after this change. The current implementation handles `Game | GameDetail`. Update it to handle `Game | BackendGameDetail`.

Current signature: `cartItemFromGame(game: Game | GameDetail): Omit<CartItem, "qty">`

New signature: `cartItemFromGame(game: Game | BackendGameDetail): Omit<CartItem, "qty">`

```typescript
import type { Game, BackendGameDetail, Platform, SteamPlatforms } from "@/lib/types";
// (drop GameDetail from import)

export function cartItemFromGame(game: Game | BackendGameDetail): Omit<CartItem, "qty"> {
  const platforms = normalizePlatforms(game.platforms);
  const isBackend = "priceFinal" in game;
  return {
    id: isBackend ? String(game.id) : game.slug,
    title: isBackend ? game.name : game.title,
    image: game.headerImage ?? null,
    platforms,
    price: isBackend ? game.priceFinal / 100 : game.price,
    originalPrice: isBackend
      ? game.priceInitial > 0 ? game.priceInitial / 100 : null
      : game.originalPrice ?? null,
    discountPercent: isBackend ? game.reductionPercentage : game.discountPercent ?? null,
  };
}
```

The `normalizePlatforms` function handles both `Platform[]` (from `Game`) and `SteamPlatforms` (from `BackendGameDetail`) — this already works and needs no change.

- [ ] **Step 1: Edit `lib/cart-store.ts`** — update the import to remove `GameDetail` and add `BackendGameDetail`; rewrite `cartItemFromGame` as shown above.

- [ ] **Step 2: Verify** the file compiles: `npx tsc --noEmit lib/cart-store.ts`. Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/cart-store.ts
git commit -m "fix: support BackendGameDetail in cartItemFromGame"
```

---

## Task 6: Update `components/product/ProductHero.tsx` — Use `BackendGameDetail`

**Files:**
- Modify: `components/product/ProductHero.tsx:1-324`

Import change: `import type { GameDetail }` → `import type { BackendGameDetail }`.

Prop type change: `{ game: GameDetail }` → `{ game: BackendGameDetail }`.

All field accesses on `game` must be updated:

| Old access | New access |
|---|---|
| `game.title` | `game.name` |
| `game.image ?? ""` | `game.headerImage ?? ""` |
| `game.movies` (type `SteamMovie[]`) | `game.movies` (type `BackendMovie[]`) |
| `m.thumbnail` | `m.thumbnail` (same) |
| `m.hls_h264` | `m.hlsH264` |
| `game.screenshots` (type `SteamScreenshot[]`) | `game.screenshots` (type `BackendScreenshot[]`) |
| `s.path_thumbnail` | `s.pathThumbnail` |
| `s.path_full` | `s.pathFull` |
| `(game.price_overview.final ?? 0) / 100` | `game.priceFinal / 100` |
| `(game.price_overview.initial ?? 0) / 100` | `game.priceInitial / 100` |
| `String(game.required_age || "E")` | `String(game.requiredAge || "E")` |
| `game.metacritic_score ?? 0` | `game.metacriticScore ?? 0` |
| `game.recommendations_total ?? 0` | `game.recommendationsTotal ?? 0` |

The `genre.description` access on `game.genres` works identically — both old `SteamGenre` (`{ id: string; description: string }`) and new `{ id: number; description: string }` have `description`.

Platform access (`game.platforms.windows/mac/linux`) is unchanged — `BackendGameDetail.platforms` is `SteamPlatforms`.

The `finalPrice` and `initialPrice` local variables are computed from `game.priceFinal` and `game.priceInitial` directly (prices already in cents from backend).

The `ProductAddToCartButton` inner component receives the same `BackendGameDetail` — no prop-level changes needed there.

```typescript
// New import line 7:
import type { BackendGameDetail } from "@/lib/types";

// New prop types line 17 and 70:
function ProductAddToCartButton({ game }: { game: BackendGameDetail }) {
export function ProductHero({ game }: { game: BackendGameDetail }) {
```

Media assembly (lines 71–85) changes:
- `m.hls_h264` → `m.hlsH264`
- `s.path_thumbnail` → `s.pathThumbnail`
- `s.path_full` → `s.pathFull`

Price computation (lines 93–94) changes:
- `finalPrice = game.price_final / 100` (was `(game.price_overview.final ?? 0) / 100`)
- `initialPrice = game.priceInitial / 100` (was `(game.price_overview.initial ?? 0) / 100`)

Score displays (lines 300, 310–311) changes:
- `game.metacritic_score ?? 0` → `game.metacriticScore ?? 0`
- `game.recommendations_total ?? 0` → `game.recommendationsTotal ?? 0`

Age text (line 95): `game.required_age` → `game.requiredAge`

Title display (line 171): `game.title` → `game.name`

Image fallback (line 117): `game.image` → `game.headerImage`

- [ ] **Step 1: Edit `components/product/ProductHero.tsx`** — apply all field access changes listed above.

- [ ] **Step 2: Verify** the component renders without TypeScript errors: `npx tsc --noEmit components/product/ProductHero.tsx`. Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/product/ProductHero.tsx
git commit -m "feat: use BackendGameDetail in ProductHero"
```

---

## Task 7: Update `components/product/GameInfoSidebar.tsx` — Use `BackendGameDetail`

**Files:**
- Modify: `components/product/GameInfoSidebar.tsx`

Import change: `import type { GameDetail }` → `import type { BackendGameDetail }`.

Prop type change: `{ game: GameDetail }` → `{ game: BackendGameDetail }`.

Field access changes:

| Old access | New access |
|---|---|
| `game.supported_languages` | `game.supportedLanguages` |
| `game.pc_requirements` | `game.pcRequirements` |
| `game.mac_requirements` | `game.macRequirements` |
| `game.linux_requirements` | `game.linuxRequirements` |
| `game.platforms.windows/mac/linux` | unchanged (same `SteamPlatforms` type) |
| `game.genres`, `game.categories` | unchanged (same types) |

The `genre.id` is now `number` instead of `string` — the `key` prop on the `.map()` is compatible since both are valid React keys.

```typescript
// Line 4: import type { GameDetail } from "@/lib/types";
// Change to:
import type { BackendGameDetail } from "@/lib/types";

// Line 6: export function GameInfoSidebar({ game }: { game: GameDetail }) {
// Change to:
export function GameInfoSidebar({ game }: { game: BackendGameDetail }) {

// Line 9: const reqs = game.pc_requirements[reqTab] || "No requirements provided.";
// Change to:
const reqs = game.pcRequirements[reqTab] || "No requirements provided.";

// Line 9 (language split): game.supported_languages
// Change to: game.supportedLanguages
```

- [ ] **Step 1: Edit `components/product/GameInfoSidebar.tsx`** — apply the 4 field access changes and prop type update.

- [ ] **Step 2: Verify** TypeScript: `npx tsc --noEmit components/product/GameInfoSidebar.tsx`. Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/product/GameInfoSidebar.tsx
git commit -m "feat: use BackendGameDetail in GameInfoSidebar"
```

---

## Task 8: Update Card and Carousel Links — Use `/games/${id}` Instead of `/games/${slug}`

**Files:**
- Modify: `components/shared/GameCard.tsx:19`
- Modify: `components/shared/ListCard.tsx:12`
- Modify: `components/home/BestsellersSection.tsx:17`
- Modify: `components/home/HeroCarousel.tsx` — 5 static `ctaLink` values

### `GameCard.tsx` and `ListCard.tsx`

The `Game` type used by these cards still has the `slug` field. Per the spec, listing pages still use `Game` with slug-based links. However, the goal is to migrate all links to use id. 

Since `Game.id` is `string` and is set from `rawToGame(item)` as `\`${item.id}-${index}\`` for featured data, or `String(item.id)` for search results, we can use `game.id` directly for the link.

**Important:** `game.id` for `Game` from featured data is `${item.id}-${index}` (e.g. `"3681010-0"`). For search results, it's `String(item.id)` (e.g. `"1245620"`). The page route `app/games/[id]/page.tsx` accepts any string and parses it with `Number(id)`. The `${item.id}-${index}` format won't parse cleanly to a valid numeric app ID.

**Decision:** Per the spec, listing page links will be migrated in a follow-up (this spec only covers the product page route). **Do NOT change `GameCard.tsx`, `ListCard.tsx`, or `BestsellersSection.tsx`** in this plan. The `HeroCarousel.tsx` static slides already have numeric `id` fields (`"3681010"`, `"1245620"`, etc.) that can be used directly.

### `HeroCarousel.tsx`

The static slides already have `id` fields as numeric strings. Change the 5 `ctaLink` values:

| Slide | Before | After |
|---|---|---|
| Nioh 3 | `/games/nioh-3` | `/games/3681010` |
| ELDEN RING | `/games/elden-ring` | `/games/1245620` |
| GTA V Enhanced | `/games/grand-theft-auto-v-enhanced` | `/games/3240220` |
| ARK: Survival Ascended | `/games/ark-survival-ascended` | `/games/2399830` |
| Resident Evil Requiem | `/games/resident-evil-requiem` | `/games/3764200` |

This is a simple string replacement on the 5 `ctaLink` fields in the static `slides` array.

- [ ] **Step 1: Edit `components/home/HeroCarousel.tsx`** — replace each `ctaLink` in the static slides array with `/games/${slide.id}` (or the hardcoded numeric equivalents listed above).

- [ ] **Step 2: Commit**

```bash
git add components/home/HeroCarousel.tsx
git commit -m "feat: use id-based links in HeroCarousel"
```

---

## Task 9: End-to-End Verification

**Files:**
- No file changes — this is a verification task.

- [ ] **Step 1: Type check entire frontend**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx tsc --noEmit`

Expected: Zero TypeScript errors. If there are errors related to:
- `GameDetail` not found — return to Task 2 and verify the type was removed cleanly
- `steamDataToGameDetail` not found — return to Task 3 and verify removal
- `getGameBySlug` not found — return to Task 4 and verify removal
- `slugify` not found — return to Task 4 and verify import removal
- `BackendGameDetail` property errors — return to the relevant component task and verify field names

- [ ] **Step 2: Build the project**

Run: `npm run build` (or `pnpm build`)

Expected: Build completes with zero errors. The `app/games/[id]/page.tsx` should be the only page serving game detail routes.

- [ ] **Step 3: Verify the old route no longer exists**

Check that `app/games/[slug]/` directory is gone: `ls app/games/`

Expected output: only `[id]` and `page.tsx` (no `[slug]`).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: verify end-to-end type check and build pass"
```

---

## Removed Code Summary

After all tasks:

| Removed | Location | Reason |
|---|---|---|
| `GameDetail` type | `lib/types.ts` | Replaced by `BackendGameDetail` |
| `DeluxePerk`, `DLCItem`, `Achievement` | `lib/types.ts` | Unused |
| `SteamPriceOverview`, `SteamPlatforms`, `SteamScreenshot`, `SteamMovie`, `SteamGenre` | `lib/types.ts` | Only used by `GameDetail` |
| `steamDataToGameDetail` | `lib/steam-api.ts` | No longer needed |
| `fetchFeaturedData`, `slugify`, `searchItemToGame`, and related helpers | `lib/steam-api.ts` | Only used by slug-based lookup |
| `getGameBySlug` | `lib/game-data.ts` | Replaced by direct `/api/steam/[id]` fetch |
| `[slug]` route directory | `app/games/[slug]/` | Replaced by `[id]` |
| `slug`-based `ctaLink` in hero slides | `lib/game-data.ts` | Replaced by `/games/${item.id}` |
| `slug`-based `ctaLink` in carousel | `components/home/HeroCarousel.tsx` | Replaced by `/games/${slide.id}` |
