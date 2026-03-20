import type { BestsellerGame } from "@/lib/types";
import { Badge } from "@/components/shared/Badge";

export function BestsellersSection({ games }: { games: BestsellerGame[] }) {
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
              href="#"
              className="group flex items-center gap-5 rounded-xl bg-surface-container-high p-4 transition-colors hover:bg-surface-bright"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center font-headline text-3xl font-bold text-on-surface-variant/30">
                {game.rank}
              </span>

              <div className="h-16 w-12 shrink-0 overflow-hidden rounded">
                <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
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
                  €{game.price.toFixed(2)}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
