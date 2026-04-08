"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Game, CatalogFilters, SortOption, ViewMode } from "@/lib/types";
import { FilterSidebar } from "./FilterSidebar";
import { ActiveFilterBar } from "./ActiveFilterBar";
import { SortDropdown } from "./SortDropdown";
import { ViewToggle } from "./ViewToggle";
import { CatalogGrid } from "./CatalogGrid";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";

interface CatalogClientProps {
  games: Game[];
  genres: string[];
  activeGenreId?: number;
  activeGenreLabel?: string;
}

const DEFAULT_FILTERS: CatalogFilters = {
  genres: [],
  priceMin: 0,
  priceMax: 100,
};

export function CatalogClient({ games, genres, activeGenreId, activeGenreLabel }: CatalogClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("bestselling");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const result = games.filter((game) => {
      if (filters.genres.length > 0 && !game.genres.some((g) => filters.genres.includes(g.description)))
        return false;
      const priceDollars = game.priceFinal / 100;
      if (priceDollars < filters.priceMin || priceDollars > filters.priceMax)
        return false;
      return true;
    });

    const sorted = [...result];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.priceFinal - b.priceFinal);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceFinal - a.priceFinal);
        break;
      case "newest":
        sorted.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
        break;
      case "discount":
        sorted.sort((a, b) => b.reductionPercentage - a.reductionPercentage);
        break;
      default:
        break;
    }
    return sorted;
  }, [games, filters, sort]);

  const totalCount = filtered.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageGames = filtered.slice(startIndex, endIndex);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  const handleFiltersChange = useCallback(
    (next: CatalogFilters) => {
      setFilters(next);
      resetPage();
    },
    [resetPage],
  );

  const handleSortChange = useCallback(
    (next: SortOption) => {
      setSort(next);
      resetPage();
    },
    [resetPage],
  );

  const handleRemoveFilter = useCallback(
    (type: "genre" | "price", value: string) => {
      setFilters((prev) => {
        if (type === "genre")
          return { ...prev, genres: prev.genres.filter((g) => g !== value) };
        return { ...prev, priceMin: DEFAULT_FILTERS.priceMin, priceMax: DEFAULT_FILTERS.priceMax };
      });
      resetPage();
    },
    [resetPage],
  );

  const handleClearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    resetPage();
  }, [resetPage]);

  const handleItemsPerPageChange = useCallback(
    (count: number) => {
      setItemsPerPage(count);
      resetPage();
    },
    [resetPage],
  );

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Active genre pill from URL param */}
        {activeGenreLabel && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Filtered by
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary ring-1 ring-inset ring-secondary/30">
              {activeGenreLabel}
              <button
                onClick={() => router.push("/games")}
                aria-label="Remove genre filter"
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-secondary/20 transition-colors"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span className="text-xs text-on-surface-variant">
              {games.length} result{games.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        <div className="mb-6">
          <ActiveFilterBar
            filters={filters}
            defaults={DEFAULT_FILTERS}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAll}
          />
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              genres={genres}
            />
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-[0_4px_20px_rgba(161,250,255,0.3)] lg:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="12" y1="18" x2="20" y2="18" />
            </svg>
            Filters
          </button>

          {/* Mobile filter drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-surface-container p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-headline text-sm font-bold text-on-surface">
                    Filters
                  </span>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={(f) => {
                    handleFiltersChange(f);
                    setMobileFiltersOpen(false);
                  }}
                  genres={genres}
                />
              </div>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-end gap-3">
              <ViewToggle value={viewMode} onChange={setViewMode} />
              <SortDropdown value={sort} onChange={handleSortChange} />
            </div>

            {pageGames.length > 0 ? (
              <>
                <CatalogGrid
                  games={pageGames}
                  viewMode={viewMode}
                  totalCount={totalCount}
                  startIndex={startIndex}
                  endIndex={endIndex}
                />
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </>
            ) : (
              <EmptyState onClearFilters={handleClearAll} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
