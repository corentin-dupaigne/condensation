"use client";

import type { RelatedGame } from "@/lib/types";

export function RelatedGames({ games }: { games: RelatedGame[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-lg font-bold uppercase tracking-wider text-on-surface">
          Related Projects
        </h2>
        <div className="flex gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Next"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {games.map((game, i) => (
          <a
            key={game.id}
            href="#"
            className="group flex flex-col gap-2 rounded-xl bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(${
                    135 + i * 45
                  }deg, hsl(${180 + i * 40}, 50%, 15%), hsl(${
                    200 + i * 30
                  }, 40%, 10%))`,
                }}
              />
              <span className="absolute bottom-2 left-2 rounded bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase text-on-primary-fixed">
                {game.genreBadge}
              </span>
            </div>
            <p className="truncate text-sm font-bold text-on-surface">
              {game.name}
            </p>
            <p className="text-sm font-semibold text-on-surface-variant">
              €{(game.priceFinal / 100).toFixed(2)}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
