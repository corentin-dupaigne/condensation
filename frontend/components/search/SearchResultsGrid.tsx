import type { Game } from "@/lib/types";
import { GameCard } from "@/components/shared/GameCard";

export function SearchResultsGrid({ games }: { games: Game[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
