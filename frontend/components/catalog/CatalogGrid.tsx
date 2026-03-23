import type { Game, ViewMode } from "@/lib/types";
import { GameCard } from "@/components/shared/GameCard";
import { ListCard } from "@/components/shared/ListCard";

interface CatalogGridProps {
  games: Game[];
  viewMode: ViewMode;
  totalCount: number;
  startIndex: number;
  endIndex: number;
}

export function CatalogGrid({
  games,
  viewMode,
  totalCount,
  startIndex,
  endIndex,
}: CatalogGridProps) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface lg:text-4xl">
          CATALOG
        </h1>
        <p className="text-xs text-on-surface-variant">
          Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of{" "}
          {totalCount.toLocaleString()} results
        </p>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} className="w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {games.map((game) => (
            <ListCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
