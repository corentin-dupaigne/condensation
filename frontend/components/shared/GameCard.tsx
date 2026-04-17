import type { Game } from "@/lib/types";
import { formatCents, originalPriceCents } from "@/lib/format-price";
import { Badge } from "./Badge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function GameCard({
  game,
  className,
}: {
  game: Game;
  className?: string;
}) {
  const hasDiscount = game.reductionPercentage > 0;
  return (
    <a
      href={`/games/${game.id}`}
      title={game.name}
      className={`group flex shrink-0 flex-col gap-2 rounded-xl bg-surface-container-high p-3 transition-colors hover:bg-surface-bright ${className ?? "w-[200px]"}`}
    >
      <div className="relative aspect-3/2 w-full overflow-hidden rounded-lg">
        {game.headerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.headerImage} alt={game.name} width={200} height={267} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2">
            <Badge type="discount">-{game.reductionPercentage}%</Badge>
          </div>
        )}
      </div>

      <h3 className="truncate font-headline text-sm font-semibold text-on-surface">
        {game.name}
      </h3>

      <div className="flex items-center gap-1.5 overflow-hidden">
        {game.genres.slice(0, 2).map((g) => (
          <span
            key={g.id}
            className="truncate rounded bg-surface-container-highest px-1.5 py-0.5 text-xs uppercase tracking-wider text-on-surface-variant"
          >
            {g.description}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          {hasDiscount && (
            <span className="text-xs text-on-surface-variant line-through">
              {formatCents(originalPriceCents(game.priceFinal, game.reductionPercentage))}
            </span>
          )}
          <span className="text-sm font-bold text-on-surface">
            {formatCents(game.priceFinal)}
          </span>
        </div>
        <AddToCartButton
          game={game}
          className="flex h-11 w-11 items-center justify-center rounded bg-surface-container-highest text-on-surface-variant transition-colors hover:bg-primary/15 hover:text-primary"
        />
      </div>
    </a>
  );
}
