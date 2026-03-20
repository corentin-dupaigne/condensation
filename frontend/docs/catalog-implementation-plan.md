# Catalog with Enhanced Filters — Implementation Plan

**Goal:** Build the `/games` catalog browse page matching the Stitch "Catalog with Enhanced Filters" design, using placeholder images and fake data.

**Architecture:** Client-side filtered catalog page. A single `CatalogClient` component owns all filter/sort/pagination state and renders the filter sidebar, active filter bar, sort controls, game grid, and pagination. All filtering and sorting happens in-memory against a static fake dataset.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4 (custom design tokens), TypeScript

**Design Reference:** Stitch project `13503954930366526011`, screen `5d0a0c29b5354cdcb27fc3287df6ff4b` ("Catalog with Enhanced Filters")

---

## File Structure

```
app/games/page.tsx                          — Server component: page shell (Header, CatalogClient, Footer)
components/catalog/CatalogClient.tsx        — "use client": owns all filter/sort/view/pagination state
components/catalog/FilterSidebar.tsx        — Left sidebar with collapsible filter groups
components/catalog/FilterGroup.tsx          — Single collapsible checkbox group (Platform, Genre, etc.)
components/catalog/PriceRangeSlider.tsx     — Dual-thumb price range input
components/catalog/ActiveFilterBar.tsx      — Row of removable filter chips + "Clear all"
components/catalog/SortDropdown.tsx         — Sort option selector dropdown
components/catalog/ViewToggle.tsx           — Grid/List view switcher
components/catalog/CatalogGrid.tsx          — Renders GameCard grid or list layout
components/catalog/Pagination.tsx           — Items-per-page selector + page navigation
components/catalog/EmptyState.tsx           — "No games found" fallback
lib/types.ts                                — Add CatalogFilters, SortOption types
lib/fake-data.ts                            — Add catalogGames array (~30 games)
```

---

## Task 1: Extend Types

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add catalog-specific types**

```typescript
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
```

---

## Task 2: Add Catalog Fake Data

**Files:**
- Modify: `lib/fake-data.ts`

- [ ] **Step 1: Create `catalogGames` array**

Add ~30 `Game` entries covering a mix of platforms (steam, epic, xbox, playstation, switch), genres, price ranges (€0.89–€69.99), various discount percentages, and badge combinations. Reuse some existing games from the homepage arrays plus add new ones to reach ~30 total. Export as `catalogGames`.

- [ ] **Step 2: Export genre and platform filter options**

```typescript
export const allPlatforms: { value: Platform; label: string }[] = [
  { value: "steam", label: "Steam" },
  { value: "epic", label: "Epic Games" },
  { value: "xbox", label: "Xbox" },
  { value: "playstation", label: "PlayStation" },
  { value: "switch", label: "Nintendo Switch" },
];

export const allGenres: string[] = [
  "Action", "RPG", "Strategy", "Indie", "Simulation",
  "Racing", "Sports", "Adventure", "Shooter", "Puzzle",
  "Horror", "Platformer", "Survival", "Sandbox", "Fighting",
];
```

---

## Task 3: FilterGroup Component

**Files:**
- Create: `components/catalog/FilterGroup.tsx`

- [ ] **Step 1: Build collapsible filter group**

A `"use client"` component. Props: `title: string`, `options: { value: string; label: string }[]`, `selected: string[]`, `onChange: (selected: string[]) => void`.

Renders a collapsible section (click title to expand/collapse) with checkboxes. Follows the design system: no borders, background differentiation only. Use `surface-container-low` background. Checkbox items use `on-surface-variant` text, selected items use `on-surface`. Title uses `font-headline` `text-sm` `uppercase` `tracking-wider`.

---

## Task 4: PriceRangeSlider Component

**Files:**
- Create: `components/catalog/PriceRangeSlider.tsx`

- [ ] **Step 1: Build dual-thumb range slider**

A `"use client"` component. Props: `min: number`, `max: number`, `value: [number, number]`, `onChange: (range: [number, number]) => void`.

Use two native `<input type="range">` elements overlaid. Display min/max values as euro amounts below the track. The track uses `surface-container-highest` background with `primary` fill between thumbs. Thumbs are 16px circles with `primary` background.

---

## Task 5: FilterSidebar Component

**Files:**
- Create: `components/catalog/FilterSidebar.tsx`

- [ ] **Step 1: Compose sidebar from FilterGroup + PriceRangeSlider**

Props: `filters: CatalogFilters`, `onFiltersChange: (filters: CatalogFilters) => void`.

Layout: vertical stack of filter groups inside a `w-64` sidebar with `surface-container-low` background. Sections:
1. Platform filter group (checkboxes)
2. Genre filter group (checkboxes)
3. Price range slider (€0–€100)

Each section separated by `py-5` spacing (no divider lines per design system).

---

## Task 6: ActiveFilterBar Component

**Files:**
- Create: `components/catalog/ActiveFilterBar.tsx`

- [ ] **Step 1: Build removable filter chips row**

Props: `filters: CatalogFilters`, `onRemoveFilter: (type: string, value: string) => void`, `onClearAll: () => void`.

Render a horizontal row of pill-shaped chips for each active filter. Each chip shows filter label + close (X) button. Chip style: `surface-container-high` background, `on-surface` text, `rounded-lg`. Close button uses `on-surface-variant` color. Price range chip shows "€{min}–€{max}" when not at defaults.

"Clear all" text button at the end, styled in `primary` color.

Only renders when at least one filter is active.

---

## Task 7: SortDropdown Component

**Files:**
- Create: `components/catalog/SortDropdown.tsx`

- [ ] **Step 1: Build sort selector**

A `"use client"` component. Props: `value: SortOption`, `onChange: (sort: SortOption) => void`.

Renders a button showing the current sort label + chevron icon. On click, opens a dropdown menu with options: Bestselling, Price: Low to High, Price: High to Low, Newest Arrivals, Biggest Discount.

Dropdown uses `surface-container-highest` background. Selected option highlighted with `primary/10` background. Close on outside click.

---

## Task 8: ViewToggle Component

**Files:**
- Create: `components/catalog/ViewToggle.tsx`

- [ ] **Step 1: Build grid/list toggle**

Props: `value: ViewMode`, `onChange: (mode: ViewMode) => void`.

Two icon buttons side by side: grid icon and list icon. Active mode uses `primary` color, inactive uses `on-surface-variant`. Container uses `surface-container-high` background with `rounded-lg`.

---

## Task 9: CatalogGrid Component

**Files:**
- Create: `components/catalog/CatalogGrid.tsx`

- [ ] **Step 1: Build responsive game grid**

Props: `games: Game[]`, `viewMode: ViewMode`.

Grid mode: CSS grid with `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` using the existing `GameCard` component.

List mode: single column stack with a horizontal card variant (image left, info right). Can create an inline list card layout within this component.

Shows results count header: "Showing {start}-{end} of {total} results".

---

## Task 10: Pagination Component

**Files:**
- Create: `components/catalog/Pagination.tsx`

- [ ] **Step 1: Build items-per-page selector + page navigation**

Props: `currentPage: number`, `totalItems: number`, `itemsPerPage: number`, `onPageChange: (page: number) => void`, `onItemsPerPageChange: (count: number) => void`.

Renders:
1. "Show items:" label with toggle buttons for 24, 48, 96
2. Previous/Next page buttons with current page indicator

Active items-per-page button uses `primary` background. Inactive uses `surface-container-high`.

---

## Task 11: EmptyState Component

**Files:**
- Create: `components/catalog/EmptyState.tsx`

- [ ] **Step 1: Build empty state fallback**

Centered message: search icon, "No games found" headline (font-headline), "Try adjusting your filters" subtext (on-surface-variant), "Clear all filters" button (primary ghost style).

---

## Task 12: CatalogClient Component (orchestrator)

**Files:**
- Create: `components/catalog/CatalogClient.tsx`

- [ ] **Step 1: Build the client-side orchestrator**

`"use client"` component. Manages all state:
- `filters: CatalogFilters` (platforms, genres, price range)
- `sort: SortOption` (default "bestselling")
- `viewMode: ViewMode` (default "grid")
- `currentPage: number` (default 1)
- `itemsPerPage: number` (default 24)

Logic:
1. Filter `catalogGames` by active filters
2. Sort filtered results by selected sort option
3. Paginate sorted results
4. Pass sliced results to `CatalogGrid`

Layout (matching Stitch design):
```
┌─────────────────────────────────────────┐
│ ActiveFilterBar                         │
├──────────┬──────────────────────────────┤
│          │ "CATALOG" headline           │
│  Filter  │ ResultsCount + ViewToggle   │
│  Sidebar │ + SortDropdown              │
│          │                              │
│          │ CatalogGrid / EmptyState     │
│          │                              │
│          │ Pagination                   │
└──────────┴──────────────────────────────┘
```

- [ ] **Step 2: Implement filter logic**

```typescript
function applyFilters(games: Game[], filters: CatalogFilters): Game[] {
  return games.filter((game) => {
    if (filters.platforms.length > 0 && !filters.platforms.includes(game.platform)) return false;
    if (filters.genres.length > 0 && !game.genres.some((g) => filters.genres.includes(g))) return false;
    if (game.price < filters.priceMin || game.price > filters.priceMax) return false;
    return true;
  });
}

function applySort(games: Game[], sort: SortOption): Game[] {
  const sorted = [...games];
  switch (sort) {
    case "price-asc": return sorted.sort((a, b) => a.price - b.price);
    case "price-desc": return sorted.sort((a, b) => b.price - a.price);
    case "newest": return sorted.sort((a, b) => /* by releaseDate */);
    case "discount": return sorted.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
    default: return sorted; // "bestselling" = default order
  }
}
```

- [ ] **Step 3: Wire up filter removal callbacks**

`onRemoveFilter` receives filter type + value and updates state. `onClearAll` resets to defaults. Page resets to 1 on any filter/sort change.

---

## Task 13: Catalog Page Route

**Files:**
- Create: `app/games/page.tsx`

- [ ] **Step 1: Create the page shell**

Server component that composes `Header`, `CatalogClient`, and `Footer`.

```typescript
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { catalogGames, allPlatforms, allGenres } from "@/lib/fake-data";

export default function CatalogPage() {
  return (
    <>
      <Header />
      <main>
        <CatalogClient
          games={catalogGames}
          platforms={allPlatforms}
          genres={allGenres}
        />
      </main>
      <Footer />
    </>
  );
}
```

---

## Task 14: Visual Polish & Responsive

- [ ] **Step 1: Mobile responsive layout**

On mobile (`<md`): FilterSidebar collapses into a "Filters" button that opens a slide-out drawer/modal. CatalogGrid drops to 2 columns. ActiveFilterBar scrolls horizontally.

- [ ] **Step 2: Design system compliance**

Verify all components follow the "No-Line Rule" (no 1px borders), use background shifts for separation, gradient CTAs, glassmorphism where appropriate, and proper surface hierarchy nesting.

- [ ] **Step 3: Hover & transition states**

Game cards transition to `surface-bright` on hover. Filter chips have subtle hover state. Sort dropdown and view toggle have smooth transitions.

---

## Implementation Order

| Order | Task | Depends On |
|-------|------|------------|
| 1 | Task 1: Extend Types | — |
| 2 | Task 2: Fake Data | Task 1 |
| 3 | Task 3: FilterGroup | — |
| 4 | Task 4: PriceRangeSlider | — |
| 5 | Task 5: FilterSidebar | Tasks 3, 4 |
| 6 | Task 6: ActiveFilterBar | Task 1 |
| 7 | Task 7: SortDropdown | Task 1 |
| 8 | Task 8: ViewToggle | Task 1 |
| 9 | Task 9: CatalogGrid | — |
| 10 | Task 10: Pagination | — |
| 11 | Task 11: EmptyState | — |
| 12 | Task 12: CatalogClient | Tasks 2, 5–11 |
| 13 | Task 13: Page Route | Task 12 |
| 14 | Task 14: Polish | Task 13 |

Tasks 3, 4, 6, 7, 8, 9, 10, 11 are independent and can be built in parallel.
