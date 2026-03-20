export function PopularSearches({ searches }: { searches: string[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-5 flex items-center gap-2">
        <svg
          className="text-primary"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
        <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface">
          Popular Searches
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {searches.map((term) => (
          <button
            key={term}
            className="rounded-full border border-outline-variant/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            {term}
          </button>
        ))}
      </div>
    </section>
  );
}
