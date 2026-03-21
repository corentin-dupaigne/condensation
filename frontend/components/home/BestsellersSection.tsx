import type { BestsellerGame } from "@/lib/types";
import { formatPrice } from "@/lib/format-price";
import { Badge } from "@/components/shared/Badge";

export function BestsellersSection({ games }: { games: BestsellerGame[] }) {
  let counter = 1;
  return (
    <section className="bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-6 font-headline text-2xl font-bold tracking-tight text-on-surface">
          Global Bestsellers
        </h2>
        <div className="space-y-3">
          {games.map((game) => (
            <a
              key={game.id}
              href={`/games/${game.slug}`}
              className="group flex items-center gap-5 rounded-xl bg-surface-container-high p-4 transition-colors hover:bg-surface-bright"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center font-headline text-3xl font-bold text-on-surface-variant/30">
                {counter++}
              </span>

              <div className="h-16 w-12 shrink-0 overflow-hidden rounded">
                {game.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={game.image} alt={game.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-headline text-base font-semibold text-on-surface">
                  {game.title}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {game.genres.join(" · ")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {game.discountPercent != null && game.discountPercent > 0 && (
                  <Badge type="discount">-{game.discountPercent}% Off</Badge>
                )}
                {game.badges.includes("popular") && (
                  <Badge type="popular">Popular</Badge>
                )}
                <span className="font-headline text-lg font-bold text-on-surface">
                  {formatPrice(game.price)}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
