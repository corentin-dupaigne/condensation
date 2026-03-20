# Search Results Page – 'Cyberpunk'

Implement the **Search Results Page** from the Stitch "Homepage" project (screen `00cbe5bb498b4ff1b0f70674d06cb188`). Uses placeholder images (gradient boxes) and hardcoded fake data. The page follows the existing design-token-based dark theme ("Neon Void").

## Proposed Changes

### Types & Data

#### [MODIFY] [types.ts](file:///Users/nlnguyen/Documents/code/fullstack_project/frontend/lib/types.ts)

Add two new types:

```ts
/* ── Search Results Page ── */

export type SearchBadgeType = "ultimate-edition" | "standard" | "legendary-bundle";

export interface SearchResultGame {
  id: string;
  title: string;
  slug: string;
  platforms: string[];        // e.g. ["PC", "PS5"]
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  badge?: SearchBadgeType;
  wishlistAdded?: boolean;
}

export interface RecentlyViewedGame {
  id: string;
  title: string;
  label: string;             // e.g. "PRE-ORDER", "BUNDLE", "PREMIUM", "DIGITAL CODE"
  price: number;
}
```

---

#### [MODIFY] [fake-data.ts](file:///Users/nlnguyen/Documents/code/fullstack_project/frontend/lib/fake-data.ts)

Add at the end:
- `searchResultGames: SearchResultGame[]` – 4 items matching the screenshot (Cyberpunk 2077, Phantom Liberty, Void Runner, Neural Link VR)
- `popularSearches: string[]` – "ELDEN RING", "FC 24", "STEAM DECK", etc.
- `recentlyViewedGames: RecentlyViewedGame[]` – 4 items (Elden Ring: Shadow of the Erdtree, Modern Warfare III, Forza Motorsport, Hollow Knight)

---

### Components (`components/search/`)

#### [NEW] [SearchHero.tsx](file:///Users/nlnguyen/Documents/code/fullstack_project/frontend/components/search/SearchHero.tsx)

Top hero section:
- Small green uppercase label: "SEARCH INTELLIGENCE"
- Large display heading: "RESULTS FOR 'CYBERPUNK'"
- Right-aligned green dot + "128 RECORDS RETRIEVED" label

---

#### [NEW] [SearchFilterBar.tsx](file:///Users/nlnguyen/Documents/code/fullstack_project/frontend/components/search/SearchFilterBar.tsx)

Filter bar below hero:
- Three ghost-style dropdown buttons: `⊜ PLATFORM ▾`, `PRICE RANGE ▾`, `PRODUCT TYPE ▾`
- Two active genre tag pills (RPG, SCI-FI) with filled styling
- Right-aligned "CLEAR ALL" text button

---

#### [NEW] [SearchResultCard.tsx](file:///Users/nlnguyen/Documents/code/fullstack_project/frontend/components/search/SearchResultCard.tsx)

Individual product card:
- Gradient placeholder image (3:4 aspect ratio)
- Optional top-left badge (colored: green for "ULTIMATE EDITION", blue for "STANDARD", purple for "LEGENDARY BUNDLE")
- Top-right wishlist heart icon button
- Title, platform pills (e.g. "PC", "PS5"), strikethrough original price + bold current price + optional discount badge

---

#### [NEW] [SearchResultsGrid.tsx](file:///Users/nlnguyen/Documents/code/fullstack_project/frontend/components/search/SearchResultsGrid.tsx)

4-column responsive grid rendering `SearchResultCard` for each game.

---

#### [NEW] [PopularSearches.tsx](file:///Users/nlnguyen/Documents/code/fullstack_project/frontend/components/search/PopularSearches.tsx)

Section with:
- Trending-up icon + "POPULAR SEARCHES" heading
- Row of outlined pill chips (e.g. "ELDEN RING", "FC 24", "STEAM DECK", etc.)

---

#### [NEW] [RecentlyViewedCarousel.tsx](file:///Users/nlnguyen/Documents/code/fullstack_project/frontend/components/search/RecentlyViewedCarousel.tsx)

Section with:
- Clock icon + "RECENTLY VIEWED" heading
- Right-aligned prev/next circular arrow buttons
- Horizontal scrollable row of landscape cards:
  - Grayscale gradient placeholder image
  - Title overlay, label tag (e.g. "PRE-ORDER", "BUNDLE"), and price

---

### Page Route

#### [NEW] [page.tsx](file:///Users/nlnguyen/Documents/code/fullstack_project/frontend/app/search/page.tsx)

Server component composing:
```
<Header />
<main>
  <SearchHero />
  <SearchFilterBar />
  <SearchResultsGrid games={searchResultGames} />
  <PopularSearches searches={popularSearches} />
  <RecentlyViewedCarousel games={recentlyViewedGames} />
</main>
<Footer />
```

---

## Verification Plan

### Automated Tests
- Run `bun run build` from `/Users/nlnguyen/Documents/code/fullstack_project/frontend` to verify zero TypeScript/build errors.

### Visual Verification
- Run `bun run dev` and open `http://localhost:3000/search` in the browser.
- Compare the rendered page against the Stitch design screenshot to confirm layout, colors, and section accuracy.
