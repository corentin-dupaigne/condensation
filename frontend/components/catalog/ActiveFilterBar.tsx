import type { CatalogFilters } from "@/lib/types";

interface ActiveFilterBarProps {
  filters: CatalogFilters;
  defaults: CatalogFilters;
  onRemoveFilter: (type: "genre" | "price", value: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterBar({
  filters,
  defaults,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterBarProps) {
  const chips: { key: string; label: string; type: "genre" | "price"; value: string }[] = [];

  for (const g of filters.genres) {
    chips.push({ key: `g-${g}`, label: g, type: "genre", value: g });
  }
  if (filters.priceMin !== defaults.priceMin || filters.priceMax !== defaults.priceMax) {
    chips.push({
      key: "price",
      label: `€${filters.priceMin}–€${filters.priceMax}`,
      type: "price",
      value: "price",
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="shrink-0 text-xs font-medium text-on-surface-variant">Active:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface"
        >
          {chip.label}
          <button
            onClick={() => onRemoveFilter(chip.type, chip.value)}
            className="flex h-4 w-4 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label={`Remove ${chip.label} filter`}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="shrink-0 text-xs font-medium text-primary transition-colors hover:text-primary-dim"
      >
        Clear all
      </button>
    </div>
  );
}
