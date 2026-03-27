import type { Game } from "@/lib/types";
import { Badge } from "./Badge";
import { PlatformBadge } from "./PlatformBadge";
import { formatPrice } from "@/lib/format-price";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function ListCard({ game }: { game: Game }) {
  const hasDiscount = game.discountPercent != null && game.discountPercent > 0;

  return (
    <a
      href={`/games/${game.slug}`}
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
            {game.platforms.map((p) => (
              <PlatformBadge key={p} platform={p} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {hasDiscount && game.originalPrice != null && (
              <span className="text-xs text-on-surface-variant line-through">
                {formatPrice(game.originalPrice)}
              </span>
            )}
            <span className="text-sm font-bold text-on-surface">
              {formatPrice(game.price)}
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
            <AddToCartButton
              game={game}
              variant="button"
              className="rounded bg-surface-container-highest px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
            />
          </div>
        </div>
      </div>
    </a>
  );
}
