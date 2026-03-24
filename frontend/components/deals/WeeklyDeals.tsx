import type { Game } from "@/lib/types";
import { formatPrice } from "@/lib/format-price";
import { Badge } from "@/components/shared/Badge";
import { PlatformBadge } from "@/components/shared/PlatformBadge";

export function WeeklyDeals({ games }: { games: Game[] }) {
  return (
    <section className="bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Weekly Deals
          </h2>
          <span className="text-sm text-on-surface-variant">
            Refreshed every Monday
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {games.map((game) => {
            const hasDiscount =
              game.discountPercent != null && game.discountPercent > 0;
            return (
              <a
                key={game.id}
                href={`/games/${game.slug}`}
                className="group flex gap-4 rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
              >
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded">
                  {game.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={game.image}
                      alt={game.title}
                      width={128}
                      height={80}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
                  )}
                  {hasDiscount && (
                    <div className="absolute top-1 left-1">
                      <Badge type="discount">-{game.discountPercent}%</Badge>
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <h3
                    className="truncate font-headline text-sm font-semibold text-on-surface"
                    title={game.title}
                  >
                    {game.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    {game.platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} />
                    ))}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-headline text-sm font-bold text-on-surface">
                      {formatPrice(game.price)}
                    </span>
                    {game.originalPrice != null && (
                      <span className="text-xs text-on-surface-variant line-through">
                        {formatPrice(game.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
