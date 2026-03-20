import type { Game } from "@/lib/types";
import { Badge } from "./Badge";
import { PlatformBadge } from "./PlatformBadge";

export function GameCard({
  game,
  className,
}: {
  game: Game;
  className?: string;
}) {
  const hasDiscount =
    game.discountPercent != null && game.discountPercent > 0;

  return (
    <a
      href="#"
      className={`group flex shrink-0 flex-col gap-2 rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright ${className ?? "w-[200px]"}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded">
        <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
        {hasDiscount && (
          <div className="absolute top-2 left-2">
            <Badge type="discount">-{game.discountPercent}%</Badge>
          </div>
        )}
        {game.badges.includes("rare") && (
          <div className="absolute top-2 left-2">
            <Badge type="rare">Rare</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <PlatformBadge platform={game.platform} />
        </div>
      </div>

      <h3 className="truncate font-headline text-sm font-semibold text-on-surface">
        {game.title}
      </h3>

      <div className="flex flex-wrap gap-1">
        {game.genres.map((genre) => (
          <span
            key={genre}
            className="text-[10px] text-on-surface-variant"
          >
            {genre}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between">
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
        <button
          className="flex h-7 w-7 items-center justify-center rounded bg-surface-container-highest text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
          aria-label={`Add ${game.title} to cart`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>
    </a>
  );
}
