import type { Game } from "@/lib/types";
import { formatPrice } from "@/lib/format-price";
import { Badge } from "./Badge";
import { PlatformBadge } from "./PlatformBadge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

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
      href={`/games/${game.slug}`}
      className={`group flex shrink-0 flex-col gap-2 rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright ${className ?? "w-[200px]"}`}
    >
      <div className="relative aspect-3/2 w-full overflow-hidden rounded">
        {game.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.image} alt={game.title} width={200} height={267} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2">
            <Badge type="discount">-{game.discountPercent}%</Badge>
          </div>
        )}
        {game.badges?.includes("rare") && (
          <div className="absolute top-2 left-2">
            <Badge type="rare">Rare</Badge>
          </div>
        )}
      </div>

      <h3 className="truncate font-headline text-sm font-semibold text-on-surface">
        {game.title}
      </h3>

      <div className="flex items-center gap-1.5">
        {game.platforms.map((p) => (
          <PlatformBadge key={p} platform={p} />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between">
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
        <AddToCartButton
          game={game}
          className="flex h-11 w-11 items-center justify-center rounded bg-surface-container-highest text-on-surface-variant transition-colors hover:bg-cta hover:text-on-cta"
        />
      </div>
    </a>
  );
}
