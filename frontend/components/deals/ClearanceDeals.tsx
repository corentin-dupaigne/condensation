import type { Game } from "@/lib/types";
import { formatPrice } from "@/lib/format-price";
import { PlatformBadge } from "@/components/shared/PlatformBadge";

export function ClearanceDeals({ games }: { games: Game[] }) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              Clearance
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Games under $10 — while supplies last
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {games.map((game) => (
            <a
              key={game.id}
              href={`/games/${game.slug}`}
              className="group rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
            >
              <div className="mb-3 aspect-[4/3] overflow-hidden rounded">
                {game.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={game.image}
                    alt={game.title}
                    width={200}
                    height={150}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
                )}
              </div>
              <h3
                className="truncate text-sm font-semibold text-on-surface"
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
                <span className="font-headline text-sm font-bold text-primary">
                  {formatPrice(game.price)}
                </span>
                {game.originalPrice != null && (
                  <span className="text-xs text-on-surface-variant line-through">
                    {formatPrice(game.originalPrice)}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
