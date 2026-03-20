import type { SearchResultGame, SearchBadgeType } from "@/lib/types";

const badgeStyles: Record<SearchBadgeType, string> = {
  "ultimate-edition": "bg-emerald-500/90 text-white",
  standard: "bg-sky-500/90 text-white",
  "legendary-bundle": "bg-violet-500/90 text-white",
};

export function SearchResultCard({ game }: { game: SearchResultGame }) {
  const hasDiscount =
    game.discountPercent != null && game.discountPercent > 0;

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
        <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container transition-transform duration-300 group-hover:scale-105" />

        {game.badge && (
          <span
            className={`absolute top-3 left-3 rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeStyles[game.badge]}`}
          >
            {game.badge.replace("-", " ")}
          </span>
        )}

        <button
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container/60 text-on-surface-variant backdrop-blur-sm transition-colors hover:text-primary"
          aria-label={`Add ${game.title} to wishlist`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <h3 className="truncate font-headline text-sm font-semibold text-on-surface">
        {game.title}
      </h3>

      <div className="flex flex-wrap gap-1.5">
        {game.platforms.map((p) => (
          <span
            key={p}
            className="rounded bg-surface-container-highest px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant"
          >
            {p}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2">
        {hasDiscount && game.originalPrice != null && (
          <span className="text-xs text-on-surface-variant line-through">
            ${game.originalPrice.toFixed(2)}
          </span>
        )}
        <span className="text-base font-bold text-on-surface">
          ${game.price.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
            -{game.discountPercent}%
          </span>
        )}
      </div>
    </div>
  );
}
