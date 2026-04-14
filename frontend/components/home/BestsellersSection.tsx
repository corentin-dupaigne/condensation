import type { BestsellerGame } from "@/lib/types";
import { formatCents } from "@/lib/format-price";
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
              href={`/games/${game.id}`}
              className="group flex items-center gap-5 rounded-xl bg-surface-container-high p-4 transition-colors hover:bg-surface-bright"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center font-headline text-3xl font-bold text-on-surface-variant/30">
                {counter++}
              </span>

              <div className="h-16 w-12 shrink-0 overflow-hidden rounded">
                {game.headerImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={game.headerImage} alt={game.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-headline text-base font-semibold text-on-surface">
                  {game.name}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {game.genres.map((g) => g.description).join(" · ")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {game.reductionPercentage > 0 && (
                  <Badge type="discount">-{game.reductionPercentage}% Off</Badge>
                )}
                <span className="font-headline text-lg font-bold text-on-surface">
                  {formatCents(game.priceFinal)}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
