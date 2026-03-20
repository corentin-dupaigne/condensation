import type { SearchResultGame } from "@/lib/types";
import { SearchResultCard } from "./SearchResultCard";

export function SearchResultsGrid({ games }: { games: SearchResultGame[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {games.map((game) => (
          <SearchResultCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
