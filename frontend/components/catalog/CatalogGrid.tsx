import type { Game, ViewMode } from "@/lib/types";
import { GameCard } from "@/components/shared/GameCard";
import { Badge } from "@/components/shared/Badge";
import { PlatformBadge } from "@/components/shared/PlatformBadge";

interface CatalogGridProps {
  games: Game[];
  viewMode: ViewMode;
  totalCount: number;
  startIndex: number;
  endIndex: number;
}

export function CatalogGrid({
  games,
  viewMode,
  totalCount,
  startIndex,
  endIndex,
}: CatalogGridProps) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface lg:text-4xl">
          CATALOG
        </h1>
        <p className="text-xs text-on-surface-variant">
          Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of{" "}
          {totalCount.toLocaleString()} results
        </p>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} className="w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {games.map((game) => (
            <ListCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListCard({ game }: { game: Game }) {
  const hasDiscount = game.discountPercent != null && game.discountPercent > 0;

  return (
    <a
      href="#"
      className="group flex gap-4 rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
    >
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded">
        <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
        {hasDiscount && (
          <div className="absolute top-1 left-1">
            <Badge type="discount">-{game.discountPercent}%</Badge>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="truncate font-headline text-sm font-semibold text-on-surface">
              {game.title}
            </h3>
            <PlatformBadge platform={game.platform} />
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {game.genres.map((genre) => (
              <span key={genre} className="text-[10px] text-on-surface-variant">
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {hasDiscount && game.originalPrice != null && (
              <span className="text-xs text-on-surface-variant line-through">
                €{game.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-sm font-bold text-on-surface">
              €{game.price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant transition-colors hover:text-primary"
              aria-label={`Add ${game.title} to wishlist`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button className="rounded bg-surface-container-highest px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </a>
  );
}
