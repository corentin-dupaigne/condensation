interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-on-surface-variant/40"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <h2 className="mt-4 font-headline text-lg font-bold text-on-surface">
        No games found
      </h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        Try adjusting your filters to see more results.
      </p>
      <button
        onClick={onClearFilters}
        className="mt-5 rounded-lg border border-outline-variant/20 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
      >
        Clear all filters
      </button>
    </div>
  );
}
