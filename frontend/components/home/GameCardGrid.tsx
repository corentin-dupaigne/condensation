import type { Game } from "@/lib/types";
import { GameCard } from "@/components/shared/GameCard";

export function GameCardGrid({
  title,
  games,
  viewAllHref,
}: {
  title: string;
  games: Game[];
  viewAllHref?: string;
}) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {viewAllHref && (
              <a
                href={viewAllHref}
                className="text-sm font-medium text-primary transition-colors hover:text-primary-dim"
              >
                View All
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
}
