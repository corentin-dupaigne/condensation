import type { CatalogFilters, Platform } from "@/lib/types";
import { FilterGroup } from "./FilterGroup";
import { PriceRangeSlider } from "./PriceRangeSlider";

interface FilterSidebarProps {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  platforms: { value: Platform; label: string }[];
  genres: string[];
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  platforms,
  genres,
}: FilterSidebarProps) {
  return (
    <aside className="w-56 shrink-0 max-lg:w-full">
      <div className="lg:sticky lg:top-20 rounded-lg bg-surface-container-low p-4">
        <FilterGroup
          title="Platform"
          options={platforms.map((p) => ({ value: p.value, label: p.label }))}
          selected={filters.platforms}
          onChange={(selected) =>
            onFiltersChange({ ...filters, platforms: selected as Platform[] })
          }
        />

        <FilterGroup
          title="Genre"
          options={genres.map((g) => ({ value: g, label: g }))}
          selected={filters.genres}
          onChange={(genres) => onFiltersChange({ ...filters, genres })}
        />

        <PriceRangeSlider
          min={0}
          max={100}
          value={[filters.priceMin, filters.priceMax]}
          onChange={([priceMin, priceMax]) =>
            onFiltersChange({ ...filters, priceMin, priceMax })
          }
        />
      </div>
    </aside>
  );
}
