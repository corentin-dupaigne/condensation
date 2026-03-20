import type { Game } from "@/lib/types";

export function NewReleasesSection({ games }: { games: Game[] }) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            New Releases
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-dim"
          >
            View All
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {games.map((game) => (
            <a
              key={game.id}
              href="#"
              className="group flex gap-4 rounded-xl bg-surface-container-high p-4 transition-colors hover:bg-surface-bright"
            >
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg">
                <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-headline text-sm font-semibold text-on-surface">
                    {game.title}
                  </h3>
                  {game.releasedAgo && (
                    <p className="mt-1 text-xs text-tertiary">{game.releasedAgo}</p>
                  )}
                </div>
                <span className="font-headline text-base font-bold text-on-surface">
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
