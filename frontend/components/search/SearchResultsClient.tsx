"use client";

import { useState, useCallback } from "react";
import type { Game, ViewMode } from "@/lib/types";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Pagination } from "@/components/catalog/Pagination";
import { ViewToggle } from "@/components/catalog/ViewToggle";
import { SortDropdown } from "@/components/catalog/SortDropdown";
import type { SortOption } from "@/lib/types";

interface SearchResultsClientProps {
  games: Game[];
  total: number;
}

export function SearchResultsClient({ games, total }: SearchResultsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortOption>("bestselling");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const sorted = [...games];
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
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageGames = sorted.slice(startIndex, endIndex);

  const resetPage = useCallback(() => setCurrentPage(1), []);
  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex items-center justify-end gap-3">
        <ViewToggle value={viewMode} onChange={setViewMode} />
        <SortDropdown
          value={sort}
          onChange={(s) => {
            setSort(s);
            resetPage();
          }}
        />
      </div>

      <CatalogGrid
        games={pageGames}
        viewMode={viewMode}
        totalCount={total}
        startIndex={startIndex}
        endIndex={endIndex}
      />

      {total > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(count) => {
            setItemsPerPage(count);
            resetPage();
          }}
        />
      )}
    </section>
  );
}
